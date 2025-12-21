import { Types } from "mongoose";
import User from "../models/User.js";
import { UserToken } from "../models/usertoken.js";
import CourseService from "../../courses/services/course.js";
import { HttpStatus, API_MESSAGES, } from "../../../constants/enums.js";
import { AppError } from "../../../middlewares/errorHandler.js";
class AuthRepository {
    courseService;
    constructor() {
        this.courseService = new CourseService();
    }
    async createUser(userData) {
        const isEmailTaken = await User.isEmailTaken(userData.email);
        if (isEmailTaken) {
            throw new AppError(API_MESSAGES.ERROR.EMAIL_ALREADY_EXISTS, HttpStatus.CONFLICT);
        }
        const user = new User(userData);
        return await user.save();
    }
    async checkEmailAvailability(email) {
        const isTaken = await User.isEmailTaken(email);
        return !isTaken;
    }
    async findUserByEmail(email, includePassword = false, includeOtp = true) {
        const query = User.findOne({ email });
        if (includePassword) {
            query.select("+password");
        }
        if (includeOtp) {
            const user = await User.findOne({ email }).select("+otp");
            return user;
        }
        return await query.exec();
    }
    async findUserByEmailAndRole(email, role, includePassword = false) {
        const query = User.findOne({ email: email, role: role });
        if (includePassword) {
            query.select("+password");
        }
        return await query.exec();
    }
    async findUserToken(userId) {
        if (!Types.ObjectId.isValid(userId)) {
            return {
                _id: "",
                userId: new Types.ObjectId(userId),
                token: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        }
        let userTokenData = await UserToken.findOne({ userId: userId });
        if (userTokenData) {
            return userTokenData;
        }
        let newUserToken = new UserToken({
            userId: userId,
            token: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await newUserToken.save();
        return newUserToken;
    }
    getUserCourses = async (userId) => {
        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        const user = await User.findById(userId).lean();
        if (!user) {
            throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        const coursesArrays = await Promise.all(user.categoryIds.map((categoryId) => this.courseService.getCoursesByCategory(categoryId.toString())));
        const courses = coursesArrays.flat();
        return courses;
    };
    async findUserById(userId, includePassword = false, includeAllFields = false) {
        if (!Types.ObjectId.isValid(userId)) {
            return null;
        }
        const pipeline = [
            {
                $match: { _id: new Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryIds",
                    foreignField: "_id",
                    as: "categories",
                },
            },
        ];
        if (!includeAllFields) {
            pipeline.push({
                $project: {
                    _id: 1,
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    dob: 1,
                    countryCode: 1,
                    phoneNumber: 1,
                    board: 1,
                    stream: 1,
                    role: 1,
                    isEmailVerified: 1,
                    courses: 1,
                    categories: 1,
                },
            });
        }
        else {
            pipeline.push({
                $project: {
                    password: 0,
                    refreshToken: 0,
                    accessToken: 0,
                    emailVerificationToken: 0,
                    passwordResetToken: 0,
                    passwordResetExpires: 0,
                    __v: 0,
                    otp: 0,
                    otpExpires: 0,
                },
            });
        }
        let result = await User.aggregate(pipeline);
        return result[0] || null;
    }
    async updateUserById(userId, updateData) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });
    }
    async setOtp(email, otp) {
        if (!email) {
            throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        await User.findOneAndUpdate({ email: email }, { otp, otpExpires: Date.now() + 10 * 60 * 1000 }, { new: true, runValidators: true });
        return await User.findOne({ email: email });
    }
    async deleteUserById(userId) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        return await User.findByIdAndDelete(userId);
    }
    async setPhoneOtp(phone, otp) {
        if (!phone) {
            throw new AppError(API_MESSAGES.ERROR.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
        }
        await User.findOneAndUpdate({ phoneNumber: phone }, { otp, otpExpires: Date.now() + 10 * 60 * 1000 }, { new: true, runValidators: true });
        return await User.findOne({ phoneNumber: phone });
    }
    async clearOtp(email) {
        let data = await User.findOneAndUpdate({ email: email }, { otp: "" }, { new: true, runValidators: true });
        return data;
    }
    async findUserByPhone(phone) {
        let userData = await User.findOne({ phoneNumber: phone })
            .select("otp firstName lastName _id otpExpires dob email ")
            .lean();
        return userData;
    }
    async clearPhoneOtp(phone) {
        let data = await User.findOneAndUpdate({ phoneNumber: phone }, { otp: "" }, { new: true, runValidators: true });
        return data;
    }
    async findUserByEmailVerificationToken(token) {
        return await User.findOne({ emailVerificationToken: token });
    }
    async findUserByPasswordResetToken(token) {
        return await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        }).select("+password");
    }
    async findUserByIdWithPassword(userId) {
        if (!Types.ObjectId.isValid(userId)) {
            return null;
        }
        return await User.findById(userId).select("+password");
    }
    async findUserByRefreshToken(refreshToken) {
        return await User.findOne({ refreshToken }).lean();
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
        let x = await User.findByIdAndUpdate(userId, { accessToken }, { new: true });
        return x;
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
    async findUsersByRole(role) {
        return await User.find({ role }).select("-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires");
    }
    async findUsersByRoleWithPagination(role, page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const query = { role };
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { universityName: { $regex: search, $options: "i" } },
            ];
        }
        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select("-password -otp -refreshToken -accessToken -emailVerificationToken -passwordResetToken -passwordResetExpires")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
}
export default AuthRepository;
//# sourceMappingURL=AuthRepository.js.map