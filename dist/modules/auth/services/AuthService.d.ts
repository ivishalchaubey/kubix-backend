import { IUser, TokenResponse, UserRole } from "../../../types/global.js";
declare class AuthService {
    private authRepository;
    constructor();
    register(userData: {
        name: string;
        email: string;
        password: string;
        role?: UserRole;
    }): Promise<{
        user: IUser;
        tokens: TokenResponse;
    }>;
    login(credentials: {
        email: string;
        password: string;
    }): Promise<{
        user: IUser;
        tokens: TokenResponse;
    }>;
    logout(userId: string): Promise<void>;
    refreshTokens(refreshToken: string): Promise<TokenResponse>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    getUserProfile(userId: string): Promise<IUser>;
    updateUserProfile(userId: string, updateData: {
        name?: string;
        email?: string;
    }): Promise<IUser>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    private generateRandomToken;
}
export default AuthService;
//# sourceMappingURL=AuthService.d.ts.map