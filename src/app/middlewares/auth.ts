import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/global.js";
import { UserRole, API_MESSAGES } from "../constants/enums.js";
import ResponseUtil from "../utils/response.js";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
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
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
      return;
        }

      let token = authHeader.substring(7); // Remove "Bearer " prefix if present
      if (!token || token === "undefined") {
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }
      // decode token
          const decoded = jwt.verify(token, config.jwt.secret) as any;

        req.user = {
          _id: decoded.userId,
          firstName: decoded.firstName ,
          lastName: decoded.lastName,
          email: decoded.email,
          role: decoded.role,
          phoneNumber: decoded.phoneNumber,
          stream: decoded.stream,
          board: decoded.board,
          
        };
        next();
      
    } catch (error) {
      ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.INVALID_TOKEN);
    }
  };

  static universityauthenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
         ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
      return;
        }

      let token = authHeader.substring(7); // Remove "Bearer " prefix if present
      if (!token || token === "undefined") {
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }
      // decode token
          const decoded = jwt.verify(token, config.jwt.secret) as any;

          if(decoded.role != "university"){
            ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.ACCESSDENIED);
            return ;
          }

        req.user = {
          _id: decoded.userId,
          firstName: decoded.firstName ,
          lastName: decoded.lastName,
          email: decoded.email,
          role: decoded.role,
          phoneNumber: decoded.phoneNumber,
          
        };
        next();
      
    } catch (error) {
      ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.INVALID_TOKEN);
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
      const decoded = jwt.verify(token, config.jwt.secret) as any;

      // TODO: Implement JWT verification
        req.user = {
           _id: decoded.userId,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          email: decoded.email,
          role: decoded.role,
          phoneNumber: decoded.phoneNumber,
        };
     
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
        ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
        return;
      }

      if (!roles.includes(req.user.role as UserRole)) {
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
      ![UserRole.USER, UserRole.ADMIN].includes(req.user.role as UserRole)
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
