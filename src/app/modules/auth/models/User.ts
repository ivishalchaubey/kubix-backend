import mongoose, { Schema } from "mongoose";
import { IUser, IUserMethods, IUserModel } from "../../../types/global.js";
import { UserRole } from "../../../constants/enums.js";
import jwt from "jsonwebtoken";
import config from "../../../config/env.js";
import bcrypt from "bcryptjs";

// Password hashing function using bcrypt
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = config.bcrypt.saltRounds;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// User schema
const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    firstName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    otp: {
      type: String,
      select: false, // Don't include OTP in queries by default
    },
    dob: {
      type: String,
      required: [true, "Date of birth is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"],
    },
    countryCode: {
      type: String,
      required: [true, "Country code is required"],
      trim: true,
      match: [/^\+\d{1,3}$/, "Country code must start with '+' followed by digits"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits long"],
    },
    board: {
      type: String,
      required: [true, "Board is required"],
      trim: true,
      enum: ["CBSE", "ICSE", "State", "IB", "Other"], // Example boards
    },
    stream: {
      type: String,
      required: [true, "Stream is required"],
      trim: true,
      enum: ["Medical", "Non Medical", "Commerce", "Arts", "Other"], // Example streams
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't include password in queries by default
    },
    otpExpires: {
      type: Date,
      select: false, // Don't include OTP expiration in queries by default
      default: Date.now,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
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
      transform: function (doc, ret: any) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.emailVerificationToken;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Only keep the unique index from the schema field definition above
// Removed duplicate indexes that were causing the warning

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash the password
    this.password = await hashPassword(this.password);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-update middleware to hash password on updates
userSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate() as any;

  if (update && update.password) {
    try {
      update.password = await hashPassword(update.password);
    } catch (error) {
      return next(error as Error);
    }
  }

  next();
});

// Instance methods
userSchema.methods.isPasswordMatch = async function (
  password: string
): Promise<boolean> {
  return comparePassword(password, this.password);
};

userSchema.methods.generateAuthTokens = async function () {
  const user = this as IUser & IUserMethods;
  const accessToken = jwt.sign(
    { sub: user._id, role: user.role },
    config.jwt.secret as string,
    { expiresIn: '7d' }
  );
  const refreshToken = jwt.sign(
    { sub: user._id, role: user.role },
    config.jwt.refreshSecret as string,
    { expiresIn: '30d' }
  );
  return {
    access: { token: accessToken, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    refresh: { token: refreshToken, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  };
};

// Static methods
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: string
): Promise<boolean> {
  const user = await this.findOne({
    email,
    ...(excludeUserId && { _id: { $ne: excludeUserId } }),
  });
  return !!user;
};

// Create and export the User model
const User = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
