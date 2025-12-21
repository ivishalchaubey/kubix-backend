import { UserRole, API_MESSAGES } from "../constants/enums.js";
import ResponseUtil from "../utils/response.js";
import jwt from "jsonwebtoken";
import config from "../config/env.js";
import AuthRepository from "../modules/auth/repositories/AuthRepository.js";
const authRepository = new AuthRepository();
class AuthMiddleware {
    static authenticate = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const token = authHeader.substring(7);
            if (!token || token === "undefined") {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await authRepository.findUserById(decoded.userId, false, true);
            if (!user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            req.user = {
                _id: user._id?.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                stream: user.stream,
                board: user.board,
            };
            next();
        }
        catch (error) {
            ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.INVALID_TOKEN);
        }
    };
    static universityauthenticate = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const token = authHeader.substring(7);
            if (!token || token === "undefined") {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await authRepository.findUserById(decoded.userId, false, true);
            if (!user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            if (user.role !== UserRole.UNIVERSITY) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.ACCESSDENIED);
                return;
            }
            req.user = {
                _id: user._id?.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
            };
            next();
        }
        catch (error) {
            ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.INVALID_TOKEN);
        }
    };
    static optionalAuth = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return next();
            }
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, config.jwt.secret);
            const user = await authRepository.findUserById(decoded.userId, false, true);
            if (!user) {
                return next();
            }
            req.user = {
                _id: user._id?.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
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
            ![UserRole.USER, UserRole.ADMIN].includes(req.user.role)) {
            ResponseUtil.forbidden(res, API_MESSAGES.ERROR.ACCESS_DENIED);
            return;
        }
        next();
    };
    static isOwnerOrAdmin = (userIdParam = "userId") => {
        return (req, res, next) => {
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
//# sourceMappingURL=auth.js.map