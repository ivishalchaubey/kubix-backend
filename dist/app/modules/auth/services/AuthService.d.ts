import { IUser, IUserToken, TokenResponse } from "../../../types/global.js";
import { UserRole } from "../../../constants/enums.js";
declare class AuthService {
    private authRepository;
    private emailService;
    constructor();
    checkEmailAvailability(email: string): Promise<{
        available: boolean;
    }>;
    register(userData: {
        firstName: string;
        lastName: string;
        dob?: string;
        countryCode: string;
        phoneNumber: string;
        board?: string;
        otherBoardName?: string;
        stream?: string;
        otherStreamName?: string;
        grade?: string;
        yearOfPassing?: string;
        email: string;
        password: string;
        role: UserRole;
        profileImage?: string;
        collegeName?: string;
        collegeCode?: string;
        location?: string;
        address?: string;
        specialization?: string;
        description?: string;
        bannerYoutubeVideoLink?: string;
        website?: string;
        bannerImage?: string;
        state?: string;
        city?: string;
        foundedYear?: string;
        courses?: Array<{
            courseName: string;
            courseDuration: string;
        }>;
    }): Promise<{
        user: IUser;
        tokens: TokenResponse;
    }>;
    sendOtp(email: string): Promise<IUser>;
    sendPhoneOtp(phone: string): Promise<IUser>;
    login(credentials: {
        email: string;
        password: string;
        role: UserRole;
    }): Promise<{
        user: IUser;
        userToken?: IUserToken;
        tokens: TokenResponse;
    }>;
    verifyOtp: (email: string, otp: string) => Promise<{
        user: IUser;
        tokens: TokenResponse;
    }>;
    verifyPhoneOtp: (phone: string, otp: string) => Promise<{
        user: IUser;
        tokens: TokenResponse;
    }>;
    logout(userId: string): Promise<void>;
    refreshTokens(refreshToken: string): Promise<TokenResponse>;
    forgotPassword(email: string, password: string): Promise<any>;
    resetPassword(userId: string, oldPassword: string, newPassword: string): Promise<void>;
    verifyEmail(email: string): Promise<void>;
    getUserProfile(userId: string): Promise<IUser>;
    updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    getUserCourses(userId: string): Promise<any>;
    changeUserStatus(userId: string, status: string): Promise<IUser>;
    getUniversities(): Promise<IUser[]>;
    getUniversitiesWithPagination(page?: number, limit?: number, search?: string): Promise<{
        universities: IUser[];
        total: number;
        page: number;
        totalPages: number;
        limit: number;
    }>;
    updateUserCoursePaymentStatus(userId: string, courseId: string): Promise<any>;
    private generateRandomToken;
}
export default AuthService;
//# sourceMappingURL=AuthService.d.ts.map