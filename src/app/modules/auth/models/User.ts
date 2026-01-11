import mongoose, { Schema } from "mongoose";
import { IUser, IUserMethods, IUserModel } from "../../../types/global.js";
import { UserRole } from "../../../constants/enums.js";
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
// Removing generic type parameters to avoid TypeScript complexity issues
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    categoryIds: {
      type: [Schema.Types.ObjectId],
      ref: "Category",
      default: [],
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
      match: [
        /^\d{4}-\d{2}-\d{2}$/,
        "Date of birth must be in YYYY-MM-DD format",
      ],
    },
    likedCourses: {
      type: [Schema.Types.ObjectId],
      ref: "Course",
      default: [],
    },
    bookmarkedCourses: {
      type: [Schema.Types.ObjectId],
      ref: "Course",
      default: [],
    },
    countryCode: {
      type: String,
      trim: true,
      match: [
        /^\+\d{1,3}$/,
        "Country code must start with '+' followed by digits",
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^\d{10}$/, "Phone number must be 10 digits long"],
    },
    board: {
      type: String,
      trim: true,
      enum: ["CBSE", "ICSE", "State", "IB", "Other"], // Example boards
    },
    otherBoardName: {
      type: String,
      trim: true,
      maxlength: [100, "Other board name cannot exceed 100 characters"],
    },
    stream: {
      type: String,
      trim: true,
      enum: ["Medical", "Non Medical", "Commerce", "Arts", "Other"], // Example streams
    },
    otherStreamName: {
      type: String,
      trim: true,
      maxlength: [100, "Other stream name cannot exceed 100 characters"],
    },
    grade: {
      type: String,
      trim: true,
    },
    yearOfPassing: {
      type: String,
      trim: true,
      match: [/^\d{4}$/, "Year of passing must be a 4-digit year"],
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
      default: UserRole.USER,
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
    },
    accessToken: {
      type: String,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    collegeName: {
      type: String,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    collegeCode: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    specialization: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    bannerYoutubeVideoLink: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
        "Invalid YouTube URL",
      ],
    },
    website: {
      type: String,
      trim: true,
      maxlength: [500, "Website URL cannot exceed 500 characters"],
    },
    bannerImage: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, "State cannot exceed 100 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },
    pincode: {
      type: String,
      trim: true,
      maxlength: [10, "Pincode cannot exceed 10 characters"],
    },
    parentGuardianName: {
      type: String,
      trim: true,
      maxlength: [100, "Parent/Guardian name cannot exceed 100 characters"],
    },
    schoolName: {
      type: String,
      trim: true,
      maxlength: [200, "School name cannot exceed 200 characters"],
    },
    foundedYear: {
      type: String,
      trim: true,
      match: [/^\d{4}$/, "Founded year must be a 4-digit year"],
    },
    courses: {
      type: [
        {
          courseName: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, "Course name cannot exceed 200 characters"],
          },
          courseDuration: {
            type: String,
            required: true,
            trim: true,
            maxlength: [50, "Course duration cannot exceed 50 characters"],
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.accessToken;
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
        delete ret.accessToken;
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
