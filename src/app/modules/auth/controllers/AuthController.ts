import { Request, Response, NextFunction } from "express";
import AuthService from "../services/AuthService.js";
import { AuthRequest } from "../../../types/global.js";
import { API_MESSAGES } from "../../../constants/enums.js";
import ResponseUtil from "../../../utils/response.js";
import logger from "../../../utils/logger.js";
import bcrypt from "bcryptjs";

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        role,
        dob,
        countryCode,
        phoneNumber,
        board,
        stream,
      } = req.body;

      const result = await this.authService.register({
        firstName,
        lastName,
        dob,
        countryCode,
        phoneNumber,
        board,
        stream,
        email,
        password,
        role,
      });

      ResponseUtil.created(res, result, API_MESSAGES.SUCCESS.USER_CREATED);
    } catch (error) {
      next(error);
    }
  };
  // send otp

  /**
   * Login user
   */
  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password, role } = req.body;

      const result = await this.authService.login({ email, password, role });

      ResponseUtil.success(res, result, API_MESSAGES.SUCCESS.LOGIN_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user
   */
  logout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        console.log("req.user<><><><><><><><> checking for logout");
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      await this.authService.logout(req.user._id);

      ResponseUtil.success(res, null, API_MESSAGES.SUCCESS.LOGOUT_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh auth tokens
   */
  refreshTokens = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      const tokens = await this.authService.refreshTokens(refreshToken);

      ResponseUtil.success(res, { tokens }, "Tokens refreshed successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Forgot password
   */
  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log("req.user<><><><><><><><> checking for forgotPassword", req.user);
      const { email , password } = req.body;


      await this.authService.forgotPassword(email , password);

      ResponseUtil.success(res, null, API_MESSAGES.SUCCESS.PASSWORD_RESET_SENT);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password
   */
  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, password } = req.body;

      await this.authService.resetPassword(token, password);

      ResponseUtil.success(
        res,
        null,
        API_MESSAGES.SUCCESS.PASSWORD_RESET_SUCCESS
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify email
   */
  verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log(
        "req.user<><><><><><><><> checking for verifyEmail",
        req.user
      );
      if (!req.user) {
        console.log("req.user<><><><><><><><> checking for verifyEmail");
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      await this.authService.verifyEmail(req.user.email);

      ResponseUtil.success(res, null, API_MESSAGES.SUCCESS.EMAIL_VERIFIED);
    } catch (error) {
      next(error);
    }
  };

  sendOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, phone, type } = req.body;

      // Generate OTP
      // Save OTP to user
      if (type == "email") {
        const user = await this.authService.sendOtp(email);

        if (!user) {
          ResponseUtil.notFound(res, API_MESSAGES.ERROR.USER_NOT_FOUND);
          return;
        }

        ResponseUtil.success(res, null, "OTP sent successfully");
      } else if (type == "phone") {
        const user = await this.authService.sendPhoneOtp(phone);

        if (!user) {
          ResponseUtil.notFound(res, API_MESSAGES.ERROR.USER_NOT_FOUND);
          return;
        }

        ResponseUtil.success(res, null, "Phone OTP sent successfully");
      }
      const user = await this.authService.sendOtp(email);

      if (!user) {
        ResponseUtil.notFound(res, API_MESSAGES.ERROR.USER_NOT_FOUND);
        return;
      }

      ResponseUtil.success(res, null, "OTP sent successfully");
    } catch (error) {
      next(error);
    }
  };

  verifyOtp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, otp, type, phone } = req.body;

      // Verify OTP
      if (type == "email") {
        const user = await this.authService.verifyOtp(email, otp);

        if (!user) {
          ResponseUtil.notFound(res, API_MESSAGES.ERROR.USER_NOT_FOUND);
          return;
        }

        ResponseUtil.success(res, user, "OTP verified successfully");
      } else if (type == "phone") {
        const user = await this.authService.verifyPhoneOtp(phone, otp);

        if (!user) {
          ResponseUtil.notFound(res, API_MESSAGES.ERROR.USER_NOT_FOUND);
          return;
        }

        ResponseUtil.success(res, user, "Phone OTP verified successfully");
      }
    } catch (error) {
      next(error);
    }
  };
  /**
   * Get user profile
   */
  getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        console.log("req.user<><><><><><><><> checking for getProfile");
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      const user = await this.authService.getUserProfile(req.user._id);

      ResponseUtil.success(res, { user }, "Profile retrieved successfully");
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   */
  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        console.log("req.user<><><><><><><><> checking for updateProfile");
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      const { name, email } = req.body;
      const updatedUser = await this.authService.updateUserProfile(
        req.user._id,
        {
          firstName: name,
          lastName: req.user.lastName, // Assuming lastName is not being updated
          email: email || req.user.email,
        }
      );

      ResponseUtil.success(
        res,
        { user: updatedUser },
        API_MESSAGES.SUCCESS.USER_UPDATED
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password
   */
  changePassword = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        console.log("req.user<><><><><><><><> checking for changePassword");
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      const { currentPassword, newPassword } = req.body;
      await this.authService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );

      ResponseUtil.success(res, null, "Password changed successfully");
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
