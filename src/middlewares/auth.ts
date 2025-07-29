import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/global.js";
import { UserRole, API_MESSAGES } from "../constants/enums.js";
import ResponseUtil from "../utils/response.js";

class AuthMiddleware {
  /**
   * Authenticate user using JWT token
   * TODO: Implement actual JWT verification when jsonwebtoken is installed
   */
  static authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      let token: string;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      } else {
        console.log("authHeader<><><><><><><><> checking for authenticate");
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      // TODO: Implement JWT verification
      // For now, mock authentication
      if (token === "valid-token") {
        req.user = {
          _id: "mock-user-id",
          name: "Mock User",
          email: "mock@example.com",
          password: "",
          role: UserRole.STUDENT,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        next();
      } else {
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.INVALID_TOKEN);
        return;
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Optional authentication - doesn't fail if no token provided
   */
  static optionalAuth = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next();
      }

      const token = authHeader.substring(7);

      // TODO: Implement JWT verification
      if (token === "valid-token") {
        req.user = {
          _id: "mock-user-id",
          name: "Mock User",
          email: "mock@example.com",
          password: "",
          role: UserRole.STUDENT,
          isEmailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      next();
    } catch (error) {
      // In optional auth, we ignore token errors and continue
      next();
    }
  };

  /**
   * Authorize user based on roles
   */
  static authorize = (...roles: UserRole[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        console.log("req.user<><><><><><><><> checking for authorize");
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      if (!roles.includes(req.user.role)) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      next();
    };
  };

  /**
   * Check if user is authenticated (has valid token)
   */
  static isAuthenticated = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      console.log("req.user<><><><><><><><> checking for isAuthenticated");
      ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
      return;
    }
    next();
  };

  /**
   * Check if user is admin
   */
  static isAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
      return;
    }
    next();
  };

  /**
   * Check if user is counselor or admin
   */
  static isCounselorOrAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (
      !req.user ||
      ![UserRole.User, UserRole.ADMIN].includes(req.user.role)
    ) {
      ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
      return;
    }
    next();
  };

  /**
   * Check if user owns the resource or is admin
   */
  static isOwnerOrAdmin = (userIdParam = "userId") => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        console.log("req.user<><><><><><><><> checking for isOwnerOrAdmin");
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      const resourceUserId = req.params[userIdParam];
      const isOwner = req.user._id === resourceUserId;
      const isAdmin = req.user.role === UserRole.ADMIN;

      if (!isOwner && !isAdmin) {
        ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
        return;
      }

      next();
    };
  };
}

export default AuthMiddleware;
