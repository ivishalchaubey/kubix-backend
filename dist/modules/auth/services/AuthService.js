import crypto from "crypto";
import AuthRepository from "../repositories/AuthRepository.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import { HttpStatus, API_MESSAGES } from "../../../constants/enums.js";
import logger from "../../../utils/logger.js";
class AuthService {
    authRepository;
    constructor() {
        this.authRepository = new AuthRepository();
    }
    async register(userData) {
        try {
            const user = await this.authRepository.createUser(userData);
            const emailVerificationToken = this.generateRandomToken();
            await this.authRepository.setEmailVerificationToken(user._id, emailVerificationToken);
            const tokens = await user.generateAuthTokens();
            await this.authRepository.updateRefreshToken(user._id, tokens.refresh.token);
            logger.info(`User registered: ${user.email}`);
            return { user, tokens };
        }
        catch (error) {
            logger.error("Registration failed:", error);
            throw error;
        }
    }
    async login(credentials) {
        try {
            const { email, password } = credentials;
            const user = await this.authRepository.findUserByEmail(email, true);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
            }
            const isPasswordMatch = await user.isPasswordMatch(password);
            if (!isPasswordMatch) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
            }
            const tokens = await user.generateAuthTokens();
            await this.authRepository.updateRefreshToken(user._id, tokens.refresh.token);
            const userWithoutPassword = await this.authRepository.findUserById(user._id);
            logger.info(`User logged in: ${user.email}`);
            return { user: userWithoutPassword, tokens };
        }
        catch (error) {
            logger.error("Login failed:", error);
            throw error;
        }
    }
    async logout(userId) {
        try {
            await this.authRepository.clearRefreshToken(userId);
            logger.info(`User logged out: ${userId}`);
        }
        catch (error) {
            logger.error("Logout failed:", error);
            throw error;
        }
    }
    async refreshTokens(refreshToken) {
        try {
            const tokens = {
                access: {
                    token: "new-mock-access-token",
                    expires: new Date(Date.now() + 15 * 60 * 1000),
                },
                refresh: {
                    token: "new-mock-refresh-token",
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            };
            logger.info("Tokens refreshed");
            return tokens;
        }
        catch (error) {
            logger.error("Token refresh failed:", error);
            throw new AppError(API_MESSAGES.ERROR.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
        }
    }
    async forgotPassword(email) {
        try {
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                return;
            }
            const resetToken = this.generateRandomToken();
            const resetExpires = new Date(Date.now() + 10 * 60 * 1000);
            await this.authRepository.setPasswordResetToken(user._id, resetToken, resetExpires);
            logger.info(`Password reset token generated for: ${email}`);
        }
        catch (error) {
            logger.error("Forgot password failed:", error);
            throw error;
        }
    }
    async resetPassword(token, newPassword) {
        try {
            const user = await this.authRepository.findUserByPasswordResetToken(token);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_TOKEN, HttpStatus.BAD_REQUEST);
            }
            await this.authRepository.updateUserPassword(user._id, newPassword);
            logger.info(`Password reset for user: ${user.email}`);
        }
        catch (error) {
            logger.error("Password reset failed:", error);
            throw error;
        }
    }
    async verifyEmail(token) {
        try {
            const user = await this.authRepository.findUserByEmailVerificationToken(token);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_TOKEN, HttpStatus.BAD_REQUEST);
            }
            await this.authRepository.verifyUserEmail(user._id);
            logger.info(`Email verified for user: ${user.email}`);
        }
        catch (error) {
            logger.error("Email verification failed:", error);
            throw error;
        }
    }
    async getUserProfile(userId) {
        try {
            const user = await this.authRepository.findUserById(userId);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            return user;
        }
        catch (error) {
            logger.error("Get user profile failed:", error);
            throw error;
        }
    }
    async updateUserProfile(userId, updateData) {
        try {
            if (updateData.email) {
                const isEmailTaken = await this.authRepository.findUserByEmail(updateData.email);
                if (isEmailTaken && isEmailTaken._id !== userId) {
                    throw new AppError(API_MESSAGES.ERROR.EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT);
                }
            }
            const updatedUser = await this.authRepository.updateUserById(userId, updateData);
            if (!updatedUser) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            logger.info(`User profile updated: ${userId}`);
            return updatedUser;
        }
        catch (error) {
            logger.error("Update user profile failed:", error);
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await this.authRepository.findUserById(userId, true);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            const isCurrentPasswordValid = await user.isPasswordMatch(currentPassword);
            if (!isCurrentPasswordValid) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_CREDENTIALS, HttpStatus.UNAUTHORIZED);
            }
            await this.authRepository.updateUserPassword(userId, newPassword);
            logger.info(`Password changed for user: ${userId}`);
        }
        catch (error) {
            logger.error("Change password failed:", error);
            throw error;
        }
    }
    generateRandomToken() {
        return crypto.randomBytes(32).toString("hex");
    }
}
export default AuthService;
//# sourceMappingURL=AuthService.js.map