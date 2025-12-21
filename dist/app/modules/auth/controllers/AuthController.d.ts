import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../../../types/global.js";
declare class AuthController {
    private authService;
    constructor();
    private includeIfExists;
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    logout: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    refreshTokens: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    sendOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    verifyOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    changePassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getUserCourses: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    changeUserStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getUniversities: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateUserCoursePaymentStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    checkEmailAvailability: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default AuthController;
//# sourceMappingURL=AuthController.d.ts.map