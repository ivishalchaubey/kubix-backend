import crypto from "crypto";
import AuthRepository from "../repositories/AuthRepository.js";
import { IUser, IUserMethods, TokenResponse } from "../../../types/global.js";
import jwt from "jsonwebtoken";
import { config } from "../../../config/env.js";
import bcrypt from "bcryptjs";
import {
  UserRole,
  HttpStatus,
  API_MESSAGES,
} from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import logger from "../../../utils/logger.js";

class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  /**
   * Register a new user
   */
  async register(userData: {
    firstName: string;
    lastName: string;
    dob: string;
    countryCode: string;
    phoneNumber: string;
    board: string;
    stream : string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ user: IUser; tokens: TokenResponse }> {
    try {
      // Check if user already exists and role is not admin
      const existingUser = await this.authRepository.findUserByEmail(userData.email);
      if (existingUser) { 
        throw new AppError(
          API_MESSAGES.ERROR.EMAIL_ALREADY_EXISTS,
          HttpStatus.CONFLICT
        );
      }
      //  check if role is admin 
      if (userData.role && userData.role === UserRole.ADMIN) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_ROLE,
          HttpStatus.FORBIDDEN
        );
      }
      // Create user
      const user = await this.authRepository.createUser(userData);

      // Generate email verification token
      const emailVerificationToken = this.generateRandomToken();
      await this.authRepository.setEmailVerificationToken(
        user._id,
        emailVerificationToken
      );

      // Generate auth tokens
      const accessToken = jwt.sign(
        { userId: user?._id, role: "user" },
        config.jwt.secret as string,
      );
      const refreshToken = jwt.sign(
        { userId: user._id, role: "user" },
        config.jwt.refreshSecret as string
        );
      
      // Store refresh token
      await this.authRepository.updateRefreshToken(
        user._id,
        refreshToken
      );

      await this.authRepository.updateAccessToken(
        user._id,
        accessToken
      );

      logger.info(`User registered: ${user.email}`);

      return { user, tokens: { access: { token: accessToken, expires: new Date(Date.now() + 15 * 60 * 1000) }, refresh: { token: refreshToken, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } } };
    } catch (error) {
      logger.error("Registration failed:", error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: {
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ user: IUser; tokens: TokenResponse }> {
    try {
      const { email, password , role } = credentials;

      // Find user with password
      const user = await this.authRepository.findUserByEmailAndRole(email,role , true);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED
        );
      }

      // Check password using the user model's method
      //  check password using bcrypt
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED
        );
      }

      // Generate auth tokens
      // const tokens = await (user as IUser & IUserMethods).generateAuthTokens();
      const accessToken = jwt.sign(
        { userId: user?._id, role: "user", email: user.email, name: user.firstName + " " + user.lastName },
        config.jwt.secret as string,
      );
      const refreshToken = jwt.sign(
        { userId: user._id, role: "user" , email: user.email , name: user.firstName + " " + user.lastName},
        config.jwt.refreshSecret as string
        );
      
      // Store refresh token
      await this.authRepository.updateRefreshToken(
        user._id,
        refreshToken
      );

      await this.authRepository.updateAccessToken(
        user._id,
        accessToken
      );


      // Remove password from user object
      const userWithoutPassword = await this.authRepository.findUserById(
        user._id
      );

      logger.info(`User logged in: ${user.email}`);

      return { user: userWithoutPassword!, tokens: { access: { token: accessToken, expires: new Date(Date.now() + 15 * 60 * 1000) }, refresh: { token: refreshToken, expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } } };
    } catch (error) {
      logger.error("Login failed:", error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string): Promise<void> {
    try {
      await this.authRepository.clearRefreshToken(userId);
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error("Logout failed:", error);
      throw error;
    }
  }

  /**
   * Refresh auth tokens
   */
  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    try {
      // TODO: Implement JWT verification when available
      // For now, mock token refresh
      const tokens: TokenResponse = {
        access: {
          token: "new-mock-access-token",
          expires: new Date(Date.now() + 15 * 60 * 1000),
        },
        refresh: {
          token: "new-mock-refresh-token",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      };

      logger.info("Tokens refreshed");
      return tokens;
    } catch (error) {
      logger.error("Token refresh failed:", error);
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_TOKEN,
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  /**
   * Forgot password - send reset token
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const user = await this.authRepository.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return;
      }

      // Generate password reset token
      const resetToken = this.generateRandomToken();
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.authRepository.setPasswordResetToken(
        user._id,
        resetToken,
        resetExpires
      );

      // TODO: Send email with reset token
      logger.info(`Password reset token generated for: ${email}`);
    } catch (error) {
      logger.error("Forgot password failed:", error);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const user = await this.authRepository.findUserByPasswordResetToken(
        token
      );
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_TOKEN,
          HttpStatus.BAD_REQUEST
        );
      }

      await this.authRepository.updateUserPassword(user._id, newPassword);

      logger.info(`Password reset for user: ${user.email}`);
    } catch (error) {
      logger.error("Password reset failed:", error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const user = await this.authRepository.findUserByEmailVerificationToken(
        token
      );
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_TOKEN,
          HttpStatus.BAD_REQUEST
        );
      }

      await this.authRepository.verifyUserEmail(user._id);

      logger.info(`Email verified for user: ${user.email}`);
    } catch (error) {
      logger.error("Email verification failed:", error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<IUser> {
    try {
      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      return user;
    } catch (error) {
      logger.error("Get user profile failed:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updateData: { firstName?: string; lastName ?:string ; email?: string }
  ): Promise<IUser> {
    try {
      // Check if new email is already taken
      if (updateData.email) {
        const isEmailTaken = await this.authRepository.findUserByEmail(
          updateData.email
        );
        if (isEmailTaken && isEmailTaken._id !== userId) {
          throw new AppError(
            API_MESSAGES.ERROR.EMAIL_ALREADY_EXISTS,
            HttpStatus.CONFLICT
          );
        }
      }

      const updatedUser = await this.authRepository.updateUserById(
        userId,
        updateData
      );
      if (!updatedUser) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      logger.info(`User profile updated: ${userId}`);
      return updatedUser;
    } catch (error) {
      logger.error("Update user profile failed:", error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.authRepository.findUserById(userId, true);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // Verify current password using the user model's method
      const isCurrentPasswordValid = await (user as IUser & IUserMethods).isPasswordMatch(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED
        );
      }

      await this.authRepository.updateUserPassword(userId, newPassword);

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error("Change password failed:", error);
      throw error;
    }
  }

  /**
   * Generate random token
   */
  private generateRandomToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }
}

export default AuthService;
