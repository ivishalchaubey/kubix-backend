import { Types } from "mongoose";
import User from "../models/User.js";
import { HttpStatus, API_MESSAGES, } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
class AuthRepository {
    async createUser(userData) {
        const isEmailTaken = await User.isEmailTaken(userData.email);
        if (isEmailTaken) {
            throw new AppError(API_MESSAGES.ERROR.EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT);
        }
        const user = new User(userData);
        return await user.save();
    }
    async findUserByEmail(email, includePassword = false) {
        const query = User.findOne({ email });
        if (includePassword) {
            query.select("+password");
        }
        return await query.exec();
    }
    async findUserById(userId, includePassword = false) {
        if (!Types.ObjectId.isValid(userId)) {
            return null;
        }
        const query = User.findById(userId);
        if (includePassword) {
            query.select("+password");
        }
        return await query.exec();
    }
    async updateUserById(userId, updateData) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });
    }
    async deleteUserById(userId) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return await User.findByIdAndDelete(userId);
    }
    async findUserByEmailVerificationToken(token) {
        return await User.findOne({ emailVerificationToken: token });
    }
    async findUserByPasswordResetToken(token) {
        return await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        });
    }
    async updateUserPassword(userId, newPassword) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return await User.findByIdAndUpdate(userId, {
            password: newPassword,
            passwordResetToken: undefined,
            passwordResetExpires: undefined,
        }, { new: true, runValidators: true });
    }
    async setEmailVerificationToken(userId, token) {
        return await User.findByIdAndUpdate(userId, { emailVerificationToken: token }, { new: true });
    }
    async setPasswordResetToken(userId, token, expires) {
        return await User.findByIdAndUpdate(userId, {
            passwordResetToken: token,
            passwordResetExpires: expires,
        }, { new: true });
    }
    async verifyUserEmail(userId) {
        return await User.findByIdAndUpdate(userId, {
            isEmailVerified: true,
            emailVerificationToken: undefined,
        }, { new: true });
    }
    async updateRefreshToken(userId, refreshToken) {
        return await User.findByIdAndUpdate(userId, { refreshToken }, { new: true });
    }
    async updateAccessToken(userId, accessToken) {
        return await User.findByIdAndUpdate(userId, { accessToken }, { new: true });
    }
    async clearRefreshToken(userId) {
        return await User.findByIdAndUpdate(userId, { refreshToken: undefined }, { new: true });
    }
    async userExists(userId) {
        if (!Types.ObjectId.isValid(userId)) {
            return false;
        }
        const user = await User.findById(userId).select("_id");
        return !!user;
    }
}
export default AuthRepository;
//# sourceMappingURL=AuthRepository.js.map