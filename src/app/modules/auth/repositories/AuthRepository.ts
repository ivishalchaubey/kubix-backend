import { Types } from "mongoose";
import User from "../models/User.js";
import { IUser } from "../../../types/global.js";
import {
  UserRole,
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";

class AuthRepository {
  /**
   * Create a new user
   */
  async createUser(userData: {
    firstName: string;
    lastName: string;
    email: string;
    dob: string;
    countryCode: string;
    phoneNumber: string;
    board: string;
    stream: string;
    password: string;
    role: UserRole;
  }): Promise<IUser> {
    // Check if email is already taken
    const isEmailTaken = await User.isEmailTaken(userData.email);
    if (isEmailTaken) {
      throw new AppError(
        API_MESSAGES.ERROR.EMAIL_ALREADY_EXISTS,
        HttpStatus.CONFLICT
      );
    }

    const user = new User(userData);
    return await user.save();
  }

  /**
   * Find user by email
   */
  async findUserByEmail(
    email: string,
    includePassword = false
  ): Promise<IUser | null> {
    const query = User.findOne({ email });
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  async findUserByEmailAndRole(
    email: string,
    role: UserRole,
    includePassword = false
  ): Promise<IUser | null> {
    const query = User.findOne({ email , role });
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  /**
   * Find user by ID
   */
  async findUserById(
    userId: string,
    includePassword = false
  ): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const query = User.findById(userId);
    if (includePassword) {
      query.select("+password");
    }
    return await query.exec();
  }

  /**
   * Update user by ID
   */
  async updateUserById(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete user by ID
   */
  async deleteUserById(userId: string): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await User.findByIdAndDelete(userId);
  }

  /**
   * Find user by email verification token
   */
  async findUserByEmailVerificationToken(token: string): Promise<IUser | null> {
    return await User.findOne({ emailVerificationToken: token });
  }

  /**
   * Find user by password reset token
   */
  async findUserByPasswordResetToken(token: string): Promise<IUser | null> {
    return await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
  }

  /**
   * Update user's password
   */
  async updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<IUser | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError(
        API_MESSAGES.ERROR.USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    return await User.findByIdAndUpdate(
      userId,
      {
        password: newPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      },
      { new: true, runValidators: true }
    );
  }

  /**
   * Set email verification token
   */
  async setEmailVerificationToken(
    userId: string,
    token: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { emailVerificationToken: token },
      { new: true }
    );
  }

  /**
   * Set password reset token
   */
  async setPasswordResetToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
      { new: true }
    );
  }

  /**
   * Verify user's email
   */
  async verifyUserEmail(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      {
        isEmailVerified: true,
        emailVerificationToken: undefined,
      },
      { new: true }
    );
  }

  /**
   * Update user's refresh token
   */
  async updateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
  }

  async updateAccessToken(
    userId: string,
    accessToken: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { accessToken },
      { new: true }
    );
  }

  /**
   * Clear user's refresh token
   */
  async clearRefreshToken(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken: undefined },
      { new: true }
    );
  }

  /**
   * Check if user exists by ID
   */
  async userExists(userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(userId)) {
      return false;
    }

    const user = await User.findById(userId).select("_id");
    return !!user;
  }
}

export default AuthRepository;
