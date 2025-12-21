import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/global.js";
import { UserRole } from "../constants/enums.js";
declare class AuthMiddleware {
    static authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    static universityauthenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    static optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    static authorize: (...roles: UserRole[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
    static isAuthenticated: (req: AuthRequest, res: Response, next: NextFunction) => void;
    static isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
    static isCounselorOrAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
    static isOwnerOrAdmin: (userIdParam?: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
}
export default AuthMiddleware;
//# sourceMappingURL=auth.d.ts.map