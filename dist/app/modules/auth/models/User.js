import mongoose, { Schema } from "mongoose";
import { UserRole } from "../../../constants/enums.js";
import jwt from "jsonwebtoken";
import config from "../../../config/env.js";
import bcrypt from "bcryptjs";
const hashPassword = async (password) => {
    const saltRounds = config.bcrypt.saltRounds;
    return await bcrypt.hash(password, saltRounds);
};
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters long"],
        select: false,
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.User,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        select: false,
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    refreshToken: {
        type: String,
        select: false,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.refreshToken;
            delete ret.emailVerificationToken;
            delete ret.passwordResetToken;
            delete ret.passwordResetExpires;
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.refreshToken;
            delete ret.emailVerificationToken;
            delete ret.passwordResetToken;
            delete ret.passwordResetExpires;
            delete ret.__v;
            return ret;
        },
    },
});
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    try {
        this.password = await hashPassword(this.password);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
    const update = this.getUpdate();
    if (update && update.password) {
        try {
            update.password = await hashPassword(update.password);
        }
        catch (error) {
            return next(error);
        }
    }
    next();
});
userSchema.methods.isPasswordMatch = async function (password) {
    return comparePassword(password, this.password);
};
userSchema.methods.generateAuthTokens = async function () {
    const user = this;
    const accessToken = jwt.sign({ sub: user._id, role: user.role }, config.jwt.secret, { expiresIn: '7d' });
    const refreshToken = jwt.sign({ sub: user._id, role: user.role }, config.jwt.refreshSecret, { expiresIn: '30d' });
    return {
        access: { token: accessToken, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        refresh: { token: refreshToken, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    };
};
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
    const user = await this.findOne({
        email,
        ...(excludeUserId && { _id: { $ne: excludeUserId } }),
    });
    return !!user;
};
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=User.js.map