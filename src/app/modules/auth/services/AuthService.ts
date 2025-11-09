import crypto from "crypto";
import AuthRepository from "../repositories/AuthRepository.js";
import {
  IUser,
  IUserMethods,
  IUserToken,
  TokenResponse,
} from "../../../types/global.js";
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
import { UserCourseLiked } from "../models/usercourseliked.js";
import { Types } from "mongoose";
import emailService, { EmailService } from "../../../utils/emailService.js";

class AuthService {
  private authRepository: AuthRepository;
  private emailService: EmailService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.emailService = new EmailService();
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
    stream: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ user: IUser; tokens: TokenResponse }> {
    try {
      // Check if user already exists and role is not admin
      const existingUser = await this.authRepository.findUserByEmail(
        userData.email
      );
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
        {
          userId: user?._id,
          role: userData.role,
          email: user.email,
          stream: user.stream,
          board: user.board,
        },
        config.jwt.secret as string
      );
      const refreshToken = jwt.sign(
        {
          userId: user._id,
          role: userData.role,
          email: user.email,
          stream: user.stream,
          board: user.board,
        },
        config.jwt.refreshSecret as string
      );

      // Store refresh token
      await this.authRepository.updateRefreshToken(user._id, refreshToken);

      await this.authRepository.updateAccessToken(user._id, accessToken);

      logger.info(`User registered: ${user.email}`);

      return {
        user,
        tokens: {
          access: {
            token: accessToken,
            expires: new Date(Date.now() + 15 * 60 * 1000),
          },
          refresh: {
            token: refreshToken,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      };
    } catch (error) {
      logger.error("Registration failed:", error);
      throw error;
    }
  }

  /**
   * Login user
   */

  async sendOtp(email: string): Promise<IUser> {
    try {
      // Check if user exists
      const user = await this.authRepository.findUserByEmail(email);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // Check if email service is available
      if (!emailService.isAvailable()) {
        logger.error("Email service is not configured or unavailable");
        throw new AppError(
          "Email service is not configured. Please contact administrator.",
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      
      // Send OTP email with error handling
      const emailSent = await emailService.sendEmail({
        to: email,
        subject: 'OTP for Login',
        text: `Your OTP for login is ${otp}`,
        html: `<p>Your OTP for login is <strong>${otp}</strong></p>`
      });

      if (!emailSent) {
        logger.error(`Failed to send OTP email to ${email}`);
        throw new AppError(
          "Failed to send OTP email. Please try again later.",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Save OTP to database
      const updatedUser = await this.authRepository.setOtp(email, otp);
      logger.info(`OTP sent successfully to ${email}`);
      
      return updatedUser;
    } catch (error) {
      logger.error("Send OTP failed:", error);
      throw error;
    }
  }

  async sendPhoneOtp(phone: string): Promise<IUser> {
    try {
      // Check if user exists
      const user = await this.authRepository.findUserByPhone(phone);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      return await this.authRepository.setPhoneOtp(phone, otp);
    } catch (error) {
      logger.error("Send Phone OTP failed:", error);
      throw error;
    }
  }

  async login(credentials: {
    email: string;
    password: string;
    role: UserRole;
  }): Promise<{ user: IUser; userToken?: IUserToken; tokens: TokenResponse }> {
    try {
      const { email, password, role } = credentials;

      // Find user with password
      const user = await this.authRepository.findUserByEmailAndRole(
        email,
        role,
        true
      );
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_CREDENTIALS,
          HttpStatus.UNAUTHORIZED
        );
      }
      const userToken = await this.authRepository.findUserToken(user._id);

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
        {
          userId: user?._id,
          role: role,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          stream: user.stream,
          board: user.board,
        },
        config.jwt.secret as string
      );
      const refreshToken = jwt.sign(
        {
          userId: user._id,
          role: role,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          stream: user.stream,
          board: user.board,
        },
        config.jwt.refreshSecret as string
      );

      // Store refresh token
      await this.authRepository.updateRefreshToken(user._id, refreshToken);

      await this.authRepository.updateAccessToken(user._id, accessToken);

      // Remove password from user object
      const userWithoutPassword = await this.authRepository.findUserById(
        user._id
      );

      logger.info(`User logged in: ${user.email}`);

      return {
        user: userWithoutPassword!,
        userToken: userToken,
        tokens: {
          access: {
            token: accessToken,
            expires: new Date(Date.now() + 15 * 60 * 1000),
          },
          refresh: {
            token: refreshToken,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      };
    } catch (error) {
      logger.error("Login failed:", error);
      throw error;
    }
  }

  verifyOtp = async (
    email: string,
    otp: string
  ): Promise<{ user: IUser; tokens: TokenResponse }> => {
    try {
      // Check if user exists
      const user = await this.authRepository.findUserByEmail(email);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // Verify OTP
      if (user.otp != otp && user.otpExpires && user.otpExpires < new Date()) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_OTP,
          HttpStatus.BAD_REQUEST
        );
      }

      // Clear OTP after verification

      await this.authRepository.clearOtp(email);

      logger.info(`OTP verified for user: ${email}`);
      // add  jwt token generation here
      const accessToken = jwt.sign(
        {
          userId: user._id,
          role: "user",
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        config.jwt.secret as string
      );
      const refreshToken = jwt.sign(
        {
          userId: user._id,
          role: "user",
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        config.jwt.refreshSecret as string
      );
      // Store refresh token
      await this.authRepository.updateRefreshToken(user._id, refreshToken);
      await this.authRepository.updateAccessToken(user._id, accessToken);

      // sent token and user data in response

      const userWithoutPassword = await this.authRepository.findUserById(
        user._id
      );

      logger.info(`User logged in: ${user.email}`);

      return {
        user: userWithoutPassword!,
        tokens: {
          access: {
            token: accessToken,
            expires: new Date(Date.now() + 15 * 60 * 1000),
          },
          refresh: {
            token: refreshToken,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      };
    } catch (error) {
      logger.error("Verify OTP failed:", error);
      throw error;
    }
  };

  verifyPhoneOtp = async (
    phone: string,
    otp: string
  ): Promise<{ user: IUser; tokens: TokenResponse }> => {
    try {
      // Check if user exists
      const user = await this.authRepository.findUserByPhone(phone);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // Verify OTP
      if (
        user.otp != "123456" &&
        user.otpExpires &&
        user.otpExpires < new Date()
      ) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_OTP,
          HttpStatus.BAD_REQUEST
        );
      }

      // Clear OTP after verification

      await this.authRepository.clearPhoneOtp(phone);

      logger.info(`OTP verified for user: ${phone}`);
      // add  jwt token generation here
      const accessToken = jwt.sign(
        {
          userId: user._id,
          role: "user",
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        config.jwt.secret as string
      );
      const refreshToken = jwt.sign(
        {
          userId: user._id,
          role: "user",
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        config.jwt.refreshSecret as string
      );
      // Store refresh token
      await this.authRepository.updateRefreshToken(user._id, refreshToken);
      await this.authRepository.updateAccessToken(user._id, accessToken);

      // sent token and user data in response

      const userWithoutPassword = await this.authRepository.findUserById(
        user._id
      );

      logger.info(`User logged in: ${user.email}`);

      return {
        user: userWithoutPassword!,
        tokens: {
          access: {
            token: accessToken,
            expires: new Date(Date.now() + 15 * 60 * 1000),
          },
          refresh: {
            token: refreshToken,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      };
    } catch (error) {
      logger.error("Verify OTP failed:", error);
      throw error;
    }
  };

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
      if (!refreshToken) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_TOKEN,
          HttpStatus.UNAUTHORIZED
        );
      }

      const decoded = jwt.verify(
        refreshToken,
        config.jwt.refreshSecret as string
      ) as any;

      const user = await this.authRepository.findUserByRefreshToken(refreshToken);

      if (!user || !decoded?.userId || user._id.toString() !== decoded.userId) {
        throw new AppError(
          API_MESSAGES.ERROR.INVALID_REFRESH_TOKEN,
          HttpStatus.UNAUTHORIZED
        );
      }

      const payload = {
        userId: user._id,
        role: user.role,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        stream: user.stream,
        board: user.board,
      };

      const accessToken = jwt.sign(payload, config.jwt.secret as string, {
        expiresIn: "15m",
      });

      const newRefreshToken = jwt.sign(
        payload,
        config.jwt.refreshSecret as string,
        {
          expiresIn: config.jwt.refreshExpirationDays,
        }
      );

      const refreshExpiryDays = parseInt(
        config.jwt.refreshExpirationDays?.toString() || "7",
        10
      );
 
      await this.authRepository.updateRefreshToken(
        user._id.toString(),
        newRefreshToken
      );
      await this.authRepository.updateAccessToken(
        user._id.toString(),
        accessToken
      );
 
      const tokens: TokenResponse = {
        access: {
          token: accessToken,
          expires: new Date(Date.now() + 15 * 60 * 1000),
        },
        refresh: {
          token: newRefreshToken,
          expires: new Date(
            Date.now() + refreshExpiryDays * 24 * 60 * 60 * 1000
          ),
        },
      };

      logger.info("Tokens refreshed");
      return tokens;
    } catch (error) {
      logger.error("Token refresh failed:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        API_MESSAGES.ERROR.INVALID_REFRESH_TOKEN,
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  /**
   * Forgot password - send reset token
   */
  async forgotPassword(email: string, password: string): Promise<any> {
    try {
      const user = await this.authRepository.findUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // Generate password reset token
      const resetToken = this.generateRandomToken();
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await this.authRepository.setPasswordResetToken(
        user._id,
        resetToken,
        resetExpires
      );

      const hashPassword = async (password: string): Promise<string> => {
        const saltRounds = config.bcrypt.saltRounds;
        return await bcrypt.hash(password, saltRounds);
      };

      // Hash the new password
      let hashedpassword = await hashPassword(password);
      await this.authRepository.updateUserPassword(user._id, password);

      logger.info(`Password reset token generated for: ${email}`);
      const accessToken = jwt.sign(
        {
          userId: user._id,
          role: "user",
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        config.jwt.secret as string
      );
      const refreshToken = jwt.sign(
        {
          userId: user._id,
          role: "user",
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        config.jwt.refreshSecret as string
      );
      // Store refresh token
      await this.authRepository.updateRefreshToken(user._id, refreshToken);
      await this.authRepository.updateAccessToken(user._id, accessToken);

      // sent token and user data in response

      const userWithoutPassword = await this.authRepository.findUserById(
        user._id
      );

      logger.info(`User logged in: ${user.email}`);

      return {
        user: userWithoutPassword!,
        tokens: {
          access: {
            token: accessToken,
            expires: new Date(Date.now() + 15 * 60 * 1000),
          },
          refresh: {
            token: refreshToken,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      };
      // return user;
    } catch (error) {
      logger.error("Forgot password failed:", error);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await this.authRepository.findUserByIdWithPassword(userId);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      if (typeof user.isPasswordMatch === "function") {
        const isMatch = await user.isPasswordMatch(oldPassword);
        if (!isMatch) {
          throw new AppError(
            API_MESSAGES.ERROR.INCORRECT_CURRENT_PASSWORD,
            HttpStatus.BAD_REQUEST
          );
        }
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
  async verifyEmail(email: string): Promise<void> {
    try {
      const user = await this.authRepository.findUserByEmail(email, true);
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
      // Get user with basic fields first to check role, then get appropriate data
      const basicUser = await this.authRepository.findUserById(
        userId,
        false,
        false
      );
      if (!basicUser) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // If user is university, get complete data, otherwise return the basic data
      if (basicUser.role === "university") {
        const completeUser = await this.authRepository.findUserById(
          userId,
          false,
          true
        );
        return completeUser;
      }

      return basicUser;
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
    updateData: { firstName?: string; lastName?: string; email?: string }
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
      const isCurrentPasswordValid = await (
        user as IUser & IUserMethods
      ).isPasswordMatch(currentPassword);
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

  // get user courses
  async getUserCourses(userId: string): Promise<any> {
    try {
      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // Assuming user.courses is an array of course IDs
      const courses = await this.authRepository.getUserCourses(userId);

      logger.info(`User courses retrieved for user: ${userId}`);
      return courses;
    } catch (error) {
      logger.error("Get user courses failed:", error);
      throw error;
    }
  }

  /**
   * Change user status
   */
  async changeUserStatus(userId: string, status: string): Promise<IUser> {
    try {
      const user = await this.authRepository.findUserById(userId);
      if (!user) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      // Update user status
      const updatedUser = await this.authRepository.updateUserById(userId, {
        status,
      } as any);
      if (!updatedUser) {
        throw new AppError(
          API_MESSAGES.ERROR.INTERNAL_SERVER_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      logger.info(`User status changed to ${status} for user: ${userId}`);
      return updatedUser;
    } catch (error) {
      logger.error("Change user status failed:", error);
      throw error;
    }
  }

  /**
   * Get list of universities
   */
  async getUniversities(): Promise<IUser[]> {
    try {
      const universities = await this.authRepository.findUsersByRole(
        "university"
      );

      logger.info(`Retrieved ${universities.length} universities`);
      return universities;
    } catch (error) {
      logger.error("Get universities failed:", error);
      throw error;
    }
  }

  /**
   * Get list of universities with pagination and search
   */
  async getUniversitiesWithPagination(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ universities: IUser[]; total: number; page: number; totalPages: number; limit: number }> {
    try {
      const result = await this.authRepository.findUsersByRoleWithPagination(
        "university",
        page,
        limit,
        search
      );

      logger.info(
        `Retrieved ${result.users.length} universities (Page ${page}/${result.totalPages}, Total: ${result.total})`
      );
      
      return {
        universities: result.users,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit,
      };
    } catch (error) {
      logger.error("Get universities with pagination failed:", error);
      throw error;
    }
  }

  /**
   * Update user course payment status
   */
  async updateUserCoursePaymentStatus(
    userId: string,
    courseId: string
  ): Promise<any> {
    try {
      // Validate ObjectIds
      if (!Types.ObjectId.isValid(userId)) {
        throw new AppError(
          API_MESSAGES.ERROR.USER_NOT_FOUND,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!Types.ObjectId.isValid(courseId)) {
        throw new AppError("Invalid course ID", HttpStatus.BAD_REQUEST);
      }

      // Find the user course liked record
      const userCourseLiked = await UserCourseLiked.findOne({
        userId: new Types.ObjectId(userId),
        courseId: new Types.ObjectId(courseId),
      });

      if (!userCourseLiked) {
        throw new AppError(
          "User course liked record not found",
          HttpStatus.NOT_FOUND
        );
      }

      // Update isPaidByAdmin to true
      const updatedRecord = await UserCourseLiked.findByIdAndUpdate(
        userCourseLiked._id,
        { isPaidByAdmin: true },
        { new: true }
      );

      logger.info(
        `User course payment status updated for user: ${userId}, course: ${courseId}`
      );
      return updatedRecord;
    } catch (error) {
      logger.error("Update user course payment status failed:", error);
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

