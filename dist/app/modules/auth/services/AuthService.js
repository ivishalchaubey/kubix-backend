import crypto from "crypto";
import AuthRepository from "../repositories/AuthRepository.js";
import jwt from "jsonwebtoken";
import { config } from "../../../config/env.js";
import bcrypt from "bcryptjs";
import { UserRole, HttpStatus, API_MESSAGES, } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
import logger from "../../../utils/logger.js";
import { UserCourseLiked } from "../models/usercourseliked.js";
import { Types } from "mongoose";
import emailService, { EmailService } from "../../../utils/emailService.js";
class AuthService {
    authRepository;
    emailService;
    constructor() {
        this.authRepository = new AuthRepository();
        this.emailService = new EmailService();
    }
    async checkEmailAvailability(email) {
        if (!email || typeof email !== "string" || !email.trim()) {
            throw new AppError("Email is required", HttpStatus.BAD_REQUEST);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const normalizedEmail = email.toLowerCase().trim();
        if (!emailRegex.test(normalizedEmail)) {
            throw new AppError("Invalid email format", HttpStatus.BAD_REQUEST);
        }
        const isAvailable = await this.authRepository.checkEmailAvailability(normalizedEmail);
        return { available: isAvailable };
    }
    async register(userData) {
        try {
            const existingUser = await this.authRepository.findUserByEmail(userData.email);
            if (existingUser) {
                throw new AppError(API_MESSAGES.ERROR.EMAIL_ALREADY_EXISTS, HttpStatus.NOT_FOUND);
            }
            if (userData.role && userData.role === UserRole.ADMIN) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_ROLE, HttpStatus.FORBIDDEN);
            }
            const user = await this.authRepository.createUser(userData);
            const emailVerificationToken = this.generateRandomToken();
            await this.authRepository.setEmailVerificationToken(user._id, emailVerificationToken);
            const accessToken = jwt.sign({
                userId: user?._id,
                role: userData.role,
                email: user.email,
                stream: user.stream,
                board: user.board,
            }, config.jwt.secret);
            const refreshToken = jwt.sign({
                userId: user._id,
                role: userData.role,
                email: user.email,
                stream: user.stream,
                board: user.board,
            }, config.jwt.refreshSecret);
            await this.authRepository.updateRefreshToken(user._id, refreshToken);
            await this.authRepository.updateAccessToken(user._id, accessToken);
            logger.info(`User registered: ${user.email}`);
            return {
                user,
                tokens: {
                    access: {
                        token: accessToken,
                        expires: new Date(Date.now() + 15 * 60 * 1000),
                    },
                    refresh: {
                        token: refreshToken,
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
            };
        }
        catch (error) {
            logger.error("Registration failed:", error);
            throw error;
        }
    }
    async sendOtp(email) {
        try {
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            if (!emailService.isAvailable()) {
                logger.error("Email service is not configured or unavailable");
                throw new AppError("Email service is not configured. Please contact administrator.", HttpStatus.SERVICE_UNAVAILABLE);
            }
            const otp = crypto.randomInt(100000, 999999).toString();
            const emailSent = await emailService.sendEmail({
                to: email,
                subject: "OTP for Login",
                text: `Your OTP for login is ${otp}`,
                html: `<p>Your OTP for login is <strong>${otp}</strong></p>`,
            });
            if (!emailSent) {
                logger.error(`Failed to send OTP email to ${email}`);
                throw new AppError("Failed to send OTP email. Please try again later.", HttpStatus.INTERNAL_SERVER_ERROR);
            }
            const updatedUser = await this.authRepository.setOtp(email, otp);
            logger.info(`OTP sent successfully to ${email}`);
            return updatedUser;
        }
        catch (error) {
            logger.error("Send OTP failed:", error);
            throw error;
        }
    }
    async sendPhoneOtp(phone) {
        try {
            const user = await this.authRepository.findUserByPhone(phone);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            const otp = crypto.randomInt(100000, 999999).toString();
            return await this.authRepository.setPhoneOtp(phone, otp);
        }
        catch (error) {
            logger.error("Send Phone OTP failed:", error);
            throw error;
        }
    }
    async login(credentials) {
        try {
            const { email, password, role } = credentials;
            const user = await this.authRepository.findUserByEmailAndRole(email, role, true);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_CREDENTIALS, HttpStatus.NOT_FOUND);
            }
            const userToken = await this.authRepository.findUserToken(user._id);
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_CREDENTIALS, HttpStatus.NOT_FOUND);
            }
            const accessToken = jwt.sign({
                userId: user?._id,
                role: role,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                stream: user.stream,
                board: user.board,
            }, config.jwt.secret);
            const refreshToken = jwt.sign({
                userId: user._id,
                role: role,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                stream: user.stream,
                board: user.board,
            }, config.jwt.refreshSecret);
            await this.authRepository.updateRefreshToken(user._id, refreshToken);
            await this.authRepository.updateAccessToken(user._id, accessToken);
            const userWithoutPassword = await this.authRepository.findUserById(user._id);
            logger.info(`User logged in: ${user.email}`);
            return {
                user: userWithoutPassword,
                userToken: userToken,
                tokens: {
                    access: {
                        token: accessToken,
                        expires: new Date(Date.now() + 15 * 60 * 1000),
                    },
                    refresh: {
                        token: refreshToken,
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
            };
        }
        catch (error) {
            logger.error("Login failed:", error);
            throw error;
        }
    }
    verifyOtp = async (email, otp) => {
        try {
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            if (user.otp != otp && user.otpExpires && user.otpExpires < new Date()) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_OTP, HttpStatus.BAD_REQUEST);
            }
            await this.authRepository.clearOtp(email);
            logger.info(`OTP verified for user: ${email}`);
            const accessToken = jwt.sign({
                userId: user._id,
                role: "user",
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            }, config.jwt.secret);
            const refreshToken = jwt.sign({
                userId: user._id,
                role: "user",
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            }, config.jwt.refreshSecret);
            await this.authRepository.updateRefreshToken(user._id, refreshToken);
            await this.authRepository.updateAccessToken(user._id, accessToken);
            const userWithoutPassword = await this.authRepository.findUserById(user._id);
            logger.info(`User logged in: ${user.email}`);
            return {
                user: userWithoutPassword,
                tokens: {
                    access: {
                        token: accessToken,
                        expires: new Date(Date.now() + 15 * 60 * 1000),
                    },
                    refresh: {
                        token: refreshToken,
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
            };
        }
        catch (error) {
            logger.error("Verify OTP failed:", error);
            throw error;
        }
    };
    verifyPhoneOtp = async (phone, otp) => {
        try {
            const user = await this.authRepository.findUserByPhone(phone);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            if (user.otp != "123456" &&
                user.otpExpires &&
                user.otpExpires < new Date()) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_OTP, HttpStatus.BAD_REQUEST);
            }
            await this.authRepository.clearPhoneOtp(phone);
            logger.info(`OTP verified for user: ${phone}`);
            const accessToken = jwt.sign({
                userId: user._id,
                role: "user",
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            }, config.jwt.secret);
            const refreshToken = jwt.sign({
                userId: user._id,
                role: "user",
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            }, config.jwt.refreshSecret);
            await this.authRepository.updateRefreshToken(user._id, refreshToken);
            await this.authRepository.updateAccessToken(user._id, accessToken);
            const userWithoutPassword = await this.authRepository.findUserById(user._id);
            logger.info(`User logged in: ${user.email}`);
            return {
                user: userWithoutPassword,
                tokens: {
                    access: {
                        token: accessToken,
                        expires: new Date(Date.now() + 15 * 60 * 1000),
                    },
                    refresh: {
                        token: refreshToken,
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
            };
        }
        catch (error) {
            logger.error("Verify OTP failed:", error);
            throw error;
        }
    };
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
            if (!refreshToken) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
            }
            const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
            const user = await this.authRepository.findUserByRefreshToken(refreshToken);
            if (!user || !decoded?.userId || user._id.toString() !== decoded.userId) {
                throw new AppError(API_MESSAGES.ERROR.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
            }
            const payload = {
                userId: user._id,
                role: user.role,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                stream: user.stream,
                board: user.board,
            };
            const accessToken = jwt.sign(payload, config.jwt.secret, {
                expiresIn: "15m",
            });
            const refreshTokenOptions = {
                expiresIn: config.jwt.refreshExpirationDays,
            };
            const newRefreshToken = jwt.sign(payload, config.jwt.refreshSecret, refreshTokenOptions);
            const refreshExpiryDays = parseInt(config.jwt.refreshExpirationDays?.toString() || "7", 10);
            await this.authRepository.updateRefreshToken(user._id.toString(), newRefreshToken);
            await this.authRepository.updateAccessToken(user._id.toString(), accessToken);
            const tokens = {
                access: {
                    token: accessToken,
                    expires: new Date(Date.now() + 15 * 60 * 1000),
                },
                refresh: {
                    token: newRefreshToken,
                    expires: new Date(Date.now() + refreshExpiryDays * 24 * 60 * 60 * 1000),
                },
            };
            logger.info("Tokens refreshed");
            return tokens;
        }
        catch (error) {
            logger.error("Token refresh failed:", error);
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(API_MESSAGES.ERROR.INVALID_REFRESH_TOKEN, HttpStatus.UNAUTHORIZED);
        }
    }
    async forgotPassword(email, password) {
        try {
            const user = await this.authRepository.findUserByEmail(email);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            const resetToken = this.generateRandomToken();
            const resetExpires = new Date(Date.now() + 10 * 60 * 1000);
            await this.authRepository.setPasswordResetToken(user._id, resetToken, resetExpires);
            const hashPassword = async (password) => {
                const saltRounds = config.bcrypt.saltRounds;
                return await bcrypt.hash(password, saltRounds);
            };
            let hashedpassword = await hashPassword(password);
            await this.authRepository.updateUserPassword(user._id, password);
            logger.info(`Password reset token generated for: ${email}`);
            const accessToken = jwt.sign({
                userId: user._id,
                role: "user",
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            }, config.jwt.secret);
            const refreshToken = jwt.sign({
                userId: user._id,
                role: "user",
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            }, config.jwt.refreshSecret);
            await this.authRepository.updateRefreshToken(user._id, refreshToken);
            await this.authRepository.updateAccessToken(user._id, accessToken);
            const userWithoutPassword = await this.authRepository.findUserById(user._id);
            logger.info(`User logged in: ${user.email}`);
            return {
                user: userWithoutPassword,
                tokens: {
                    access: {
                        token: accessToken,
                        expires: new Date(Date.now() + 15 * 60 * 1000),
                    },
                    refresh: {
                        token: refreshToken,
                        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                },
            };
        }
        catch (error) {
            logger.error("Forgot password failed:", error);
            throw error;
        }
    }
    async resetPassword(userId, oldPassword, newPassword) {
        try {
            const user = await this.authRepository.findUserByIdWithPassword(userId);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            const userWithMethods = user;
            if (typeof userWithMethods.isPasswordMatch === "function") {
                const isMatch = await userWithMethods.isPasswordMatch(oldPassword);
                if (!isMatch) {
                    throw new AppError(API_MESSAGES.ERROR.INCORRECT_CURRENT_PASSWORD, HttpStatus.BAD_REQUEST);
                }
            }
            await this.authRepository.updateUserPassword(user._id, newPassword);
            logger.info(`Password reset for user: ${user.email}`);
        }
        catch (error) {
            logger.error("Password reset failed:", error);
            throw error;
        }
    }
    async verifyEmail(email) {
        try {
            const user = await this.authRepository.findUserByEmail(email, true);
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
            const basicUser = await this.authRepository.findUserById(userId, false, false);
            if (!basicUser) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            if (basicUser.role === "university") {
                const completeUser = await this.authRepository.findUserById(userId, false, true);
                return completeUser;
            }
            return basicUser;
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
    async getUserCourses(userId) {
        try {
            const user = await this.authRepository.findUserById(userId);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            const courses = await this.authRepository.getUserCourses(userId);
            logger.info(`User courses retrieved for user: ${userId}`);
            return courses;
        }
        catch (error) {
            logger.error("Get user courses failed:", error);
            throw error;
        }
    }
    async changeUserStatus(userId, status) {
        try {
            const user = await this.authRepository.findUserById(userId);
            if (!user) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
            }
            const updatedUser = await this.authRepository.updateUserById(userId, {
                status,
            });
            if (!updatedUser) {
                throw new AppError(API_MESSAGES.ERROR.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            logger.info(`User status changed to ${status} for user: ${userId}`);
            return updatedUser;
        }
        catch (error) {
            logger.error("Change user status failed:", error);
            throw error;
        }
    }
    async getUniversities() {
        try {
            const universities = await this.authRepository.findUsersByRole("university");
            logger.info(`Retrieved ${universities.length} universities`);
            return universities;
        }
        catch (error) {
            logger.error("Get universities failed:", error);
            throw error;
        }
    }
    async getUniversitiesWithPagination(page = 1, limit = 10, search) {
        try {
            const result = await this.authRepository.findUsersByRoleWithPagination("university", page, limit, search);
            logger.info(`Retrieved ${result.users.length} universities (Page ${page}/${result.totalPages}, Total: ${result.total})`);
            return {
                universities: result.users,
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                limit,
            };
        }
        catch (error) {
            logger.error("Get universities with pagination failed:", error);
            throw error;
        }
    }
    async updateUserCoursePaymentStatus(userId, courseId) {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.BAD_REQUEST);
            }
            if (!Types.ObjectId.isValid(courseId)) {
                throw new AppError("Invalid course ID", HttpStatus.BAD_REQUEST);
            }
            const userCourseLiked = await UserCourseLiked.findOne({
                userId: new Types.ObjectId(userId),
                courseId: new Types.ObjectId(courseId),
            });
            if (!userCourseLiked) {
                throw new AppError("User course liked record not found", HttpStatus.NOT_FOUND);
            }
            const updatedRecord = await UserCourseLiked.findByIdAndUpdate(userCourseLiked._id, { isPaidByAdmin: true }, { new: true });
            logger.info(`User course payment status updated for user: ${userId}, course: ${courseId}`);
            return updatedRecord;
        }
        catch (error) {
            logger.error("Update user course payment status failed:", error);
            throw error;
        }
    }
    generateRandomToken() {
        return crypto.randomBytes(32).toString("hex");
    }
}
export default AuthService;
//# sourceMappingURL=AuthService.js.map