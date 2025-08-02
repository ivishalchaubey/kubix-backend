import { UserRole, API_MESSAGES } from "../constants/enums.js";
import ResponseUtil from "../utils/response.js";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
class AuthMiddleware {
    static authenticate = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            console.log("authHeader<><><><><><><><> checking for authenticate", authHeader);
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            let token = authHeader.substring(7);
            const decoded = jwt.verify(token, config.jwt.secret);
            console.log("decoded<><><><><><><><> checking for authenticate", decoded);
            req.user = {
                _id: decoded.userId,
                name: decoded.name,
                email: decoded.email,
                password: "",
                isEmailVerified: true,
                role: decoded.role,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            next();
        }
        catch (error) {
            next(error);
        }
    };
    static optionalAuth = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return next();
            }
            const token = authHeader.substring(7);
            console.log("authHeader<><><><><><><><> checking for optionalAuth", authHeader);
            const decoded = jwt.verify(token, config.jwt.secret);
            req.user = {
                _id: decoded.userId,
                name: decoded.name,
                email: decoded.email,
                password: "",
                isEmailVerified: true,
                role: decoded.role,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            next();
        }
        catch (error) {
            next();
        }
    };
    static authorize = (...roles) => {
        return (req, res, next) => {
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
    static isAuthenticated = (req, res, next) => {
        if (!req.user) {
            console.log("req.user<><><><><><><><> checking for isAuthenticated");
            ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
            return;
        }
        next();
    };
    static isAdmin = (req, res, next) => {
        if (!req.user || req.user.role !== UserRole.ADMIN) {
            ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
            return;
        }
        next();
    };
    static isCounselorOrAdmin = (req, res, next) => {
        if (!req.user ||
            ![UserRole.User, UserRole.ADMIN].includes(req.user.role)) {
            ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
            return;
        }
        next();
    };
    static isOwnerOrAdmin = (userIdParam = "userId") => {
        return (req, res, next) => {
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
//# sourceMappingURL=auth.js.map