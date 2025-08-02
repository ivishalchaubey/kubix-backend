import { IUser } from "../../../types/global.js";
import { UserRole } from "../../../constants/enums.js";
declare class AuthRepository {
    createUser(userData: {
        name: string;
        email: string;
        password: string;
        role?: UserRole;
    }): Promise<IUser>;
    findUserByEmail(email: string, includePassword?: boolean): Promise<IUser | null>;
    findUserById(userId: string, includePassword?: boolean): Promise<IUser | null>;
    updateUserById(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUserById(userId: string): Promise<IUser | null>;
    findUserByEmailVerificationToken(token: string): Promise<IUser | null>;
    findUserByPasswordResetToken(token: string): Promise<IUser | null>;
    updateUserPassword(userId: string, newPassword: string): Promise<IUser | null>;
    setEmailVerificationToken(userId: string, token: string): Promise<IUser | null>;
    setPasswordResetToken(userId: string, token: string, expires: Date): Promise<IUser | null>;
    verifyUserEmail(userId: string): Promise<IUser | null>;
    updateRefreshToken(userId: string, refreshToken: string): Promise<IUser | null>;
    updateAccessToken(userId: string, accessToken: string): Promise<IUser | null>;
    clearRefreshToken(userId: string): Promise<IUser | null>;
    userExists(userId: string): Promise<boolean>;
}
export default AuthRepository;
//# sourceMappingURL=AuthRepository.d.ts.map