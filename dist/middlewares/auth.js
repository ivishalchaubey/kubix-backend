import { UserRole } from "../types/global.js";
import { API_MESSAGES } from "../constants/enums.js";
import ResponseUtil from "../utils/response.js";
class AuthMiddleware {
    static authenticate = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            let token;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
            else {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
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
            }
            else {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.INVALID_TOKEN);
                return;
            }
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
            ![UserRole.COUNSELOR, UserRole.ADMIN].includes(req.user.role)) {
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