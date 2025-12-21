import AuthService from "../services/AuthService.js";
import { API_MESSAGES } from "../../../constants/enums.js";
import ResponseUtil from "../../../utils/response.js";
class AuthController {
    authService;
    constructor() {
        this.authService = new AuthService();
    }
    includeIfExists(obj, key, value) {
        if (value !== undefined && value !== null && value !== "") {
            obj[key] = value;
        }
    }
    register = async (req, res, next) => {
        try {
            const { firstName, lastName, email, password, role, dob, countryCode, phoneNumber, board, otherBoardName, stream, otherStreamName, grade, yearOfPassing, profileImage, collegeName, collegeCode, location, address, specialization, description, bannerYoutubeVideoLink, website, bannerImage, state, city, foundedYear, courses, } = req.body;
            const registrationData = {
                firstName,
                lastName,
                email,
                password,
                role,
            };
            this.includeIfExists(registrationData, "dob", dob);
            this.includeIfExists(registrationData, "countryCode", countryCode);
            this.includeIfExists(registrationData, "phoneNumber", phoneNumber);
            this.includeIfExists(registrationData, "board", board);
            this.includeIfExists(registrationData, "otherBoardName", otherBoardName);
            this.includeIfExists(registrationData, "stream", stream);
            this.includeIfExists(registrationData, "otherStreamName", otherStreamName);
            this.includeIfExists(registrationData, "grade", grade);
            this.includeIfExists(registrationData, "yearOfPassing", yearOfPassing);
            this.includeIfExists(registrationData, "profileImage", profileImage);
            this.includeIfExists(registrationData, "collegeName", collegeName);
            this.includeIfExists(registrationData, "collegeCode", collegeCode);
            this.includeIfExists(registrationData, "location", location);
            this.includeIfExists(registrationData, "address", address);
            this.includeIfExists(registrationData, "specialization", specialization);
            this.includeIfExists(registrationData, "description", description);
            this.includeIfExists(registrationData, "bannerYoutubeVideoLink", bannerYoutubeVideoLink);
            this.includeIfExists(registrationData, "website", website);
            this.includeIfExists(registrationData, "bannerImage", bannerImage);
            this.includeIfExists(registrationData, "state", state);
            this.includeIfExists(registrationData, "city", city);
            this.includeIfExists(registrationData, "foundedYear", foundedYear);
            this.includeIfExists(registrationData, "courses", courses);
            const result = await this.authService.register(registrationData);
            ResponseUtil.created(res, result, API_MESSAGES.SUCCESS.USER_CREATED);
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const { email, password, role } = req.body;
            const result = await this.authService.login({ email, password, role });
            ResponseUtil.success(res, result, API_MESSAGES.SUCCESS.LOGIN_SUCCESS);
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (req, res, next) => {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            await this.authService.logout(req.user._id);
            ResponseUtil.success(res, null, API_MESSAGES.SUCCESS.LOGOUT_SUCCESS);
        }
        catch (error) {
            next(error);
        }
    };
    refreshTokens = async (req, res, next) => {
        try {
            const { refreshToken } = req.body;
            const tokens = await this.authService.refreshTokens(refreshToken);
            ResponseUtil.success(res, { tokens }, "Tokens refreshed successfully");
        }
        catch (error) {
            next(error);
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            let result = await this.authService.forgotPassword(email, password);
            ResponseUtil.success(res, result, API_MESSAGES.SUCCESS.PASSWORD_RESET_SUCCESS);
        }
        catch (error) {
            next(error);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            if (!req.user || !req.user._id) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const { oldPassword, newPassword } = req.body;
            await this.authService.resetPassword(req.user._id, oldPassword, newPassword);
            ResponseUtil.success(res, null, API_MESSAGES.SUCCESS.PASSWORD_RESET_SUCCESS);
        }
        catch (error) {
            next(error);
        }
    };
    verifyEmail = async (req, res, next) => {
        try {
            console.log("req.user<><><><><><><><> checking for verifyEmail", req.user);
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            await this.authService.verifyEmail(req.user.email);
            ResponseUtil.success(res, null, API_MESSAGES.SUCCESS.EMAIL_VERIFIED);
        }
        catch (error) {
            next(error);
        }
    };
    sendOtp = async (req, res, next) => {
        try {
            const { email, phone, type } = req.body;
            const user = await this.authService.sendOtp(email);
            if (!user) {
                ResponseUtil.notFound(res, API_MESSAGES.ERROR.USER_NOT_FOUND);
                return;
            }
            ResponseUtil.success(res, null, "OTP sent successfully");
        }
        catch (error) {
            next(error);
        }
    };
    verifyOtp = async (req, res, next) => {
        try {
            const { email, otp, type, phone } = req.body;
            if (type == "email") {
                const user = await this.authService.verifyOtp(email, otp);
                if (!user) {
                    ResponseUtil.notFound(res, API_MESSAGES.ERROR.USER_NOT_FOUND);
                    return;
                }
                ResponseUtil.success(res, user, "OTP verified successfully");
            }
            else if (type == "phone") {
                const user = await this.authService.verifyPhoneOtp(phone, otp);
                if (!user) {
                    ResponseUtil.notFound(res, API_MESSAGES.ERROR.USER_NOT_FOUND);
                    return;
                }
                ResponseUtil.success(res, user, "Phone OTP verified successfully");
            }
        }
        catch (error) {
            next(error);
        }
    };
    getProfile = async (req, res, next) => {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const user = await this.authService.getUserProfile(req.user._id);
            ResponseUtil.success(res, { user }, "Profile retrieved successfully");
        }
        catch (error) {
            next(error);
        }
    };
    updateProfile = async (req, res, next) => {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const { categoryIds, name, email } = req.body;
            let updateData = {};
            if (name)
                updateData.name = name;
            if (email)
                updateData.email = email;
            if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
                updateData.categoryIds = categoryIds;
            }
            const updatedUser = await this.authService.updateUserProfile(req.user._id, updateData);
            ResponseUtil.success(res, { user: updatedUser }, API_MESSAGES.SUCCESS.USER_UPDATED);
        }
        catch (error) {
            next(error);
        }
    };
    changePassword = async (req, res, next) => {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const { currentPassword, newPassword } = req.body;
            await this.authService.changePassword(req.user._id, currentPassword, newPassword);
            ResponseUtil.success(res, null, "Password changed successfully");
        }
        catch (error) {
            next(error);
        }
    };
    getUserCourses = async (req, res, next) => {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const userId = req.user._id;
            const courses = await this.authService.getUserCourses(userId);
            ResponseUtil.success(res, { courses }, "User courses retrieved successfully");
        }
        catch (error) {
            next(error);
        }
    };
    updateUser = async (req, res, next) => {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const { userId, status, firstName, lastName, email, phoneNumber, countryCode, profileImage, collegeName, collegeCode, location, address, specialization, description, bannerYoutubeVideoLink, website, bannerImage, state, city, foundedYear, courses, } = req.body;
            if (!userId) {
                ResponseUtil.badRequest(res, "userId is required");
                return;
            }
            if (status) {
                const validStatuses = ["active", "inactive"];
                if (!validStatuses.includes(status)) {
                    ResponseUtil.badRequest(res, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
                    return;
                }
            }
            let updateData = {};
            this.includeIfExists(updateData, "status", status);
            this.includeIfExists(updateData, "firstName", firstName);
            this.includeIfExists(updateData, "lastName", lastName);
            this.includeIfExists(updateData, "email", email);
            this.includeIfExists(updateData, "phoneNumber", phoneNumber);
            this.includeIfExists(updateData, "countryCode", countryCode);
            this.includeIfExists(updateData, "profileImage", profileImage);
            this.includeIfExists(updateData, "collegeName", collegeName);
            this.includeIfExists(updateData, "collegeCode", collegeCode);
            this.includeIfExists(updateData, "location", location);
            this.includeIfExists(updateData, "address", address);
            this.includeIfExists(updateData, "specialization", specialization);
            this.includeIfExists(updateData, "description", description);
            this.includeIfExists(updateData, "bannerYoutubeVideoLink", bannerYoutubeVideoLink);
            this.includeIfExists(updateData, "website", website);
            this.includeIfExists(updateData, "bannerImage", bannerImage);
            this.includeIfExists(updateData, "state", state);
            this.includeIfExists(updateData, "city", city);
            this.includeIfExists(updateData, "foundedYear", foundedYear);
            this.includeIfExists(updateData, "courses", courses);
            if (Object.keys(updateData).length === 0) {
                ResponseUtil.badRequest(res, "No update data provided");
                return;
            }
            const result = await this.authService.updateUserProfile(userId, updateData);
            ResponseUtil.success(res, { user: result }, "User updated successfully");
        }
        catch (error) {
            next(error);
        }
    };
    changeUserStatus = async (req, res, next) => {
        try {
            if (!req.user) {
                ResponseUtil.unauthorized(res, API_MESSAGES.ERROR.UNAUTHORIZED);
                return;
            }
            const { userId, status } = req.body;
            if (!userId || !status) {
                ResponseUtil.badRequest(res, "userId and status are required");
                return;
            }
            const validStatuses = ["active", "inactive"];
            if (!validStatuses.includes(status)) {
                ResponseUtil.badRequest(res, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
                return;
            }
            const result = await this.authService.changeUserStatus(userId, status);
            ResponseUtil.success(res, { user: result }, `User status changed to ${status} successfully`);
        }
        catch (error) {
            next(error);
        }
    };
    getUniversities = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            if (page < 1) {
                ResponseUtil.badRequest(res, "Page must be greater than 0");
                return;
            }
            if (limit < 1 || limit > 100) {
                ResponseUtil.badRequest(res, "Limit must be between 1 and 100");
                return;
            }
            const result = await this.authService.getUniversitiesWithPagination(page, limit, search);
            ResponseUtil.success(res, result, "Universities retrieved successfully");
        }
        catch (error) {
            next(error);
        }
    };
    updateUserCoursePaymentStatus = async (req, res, next) => {
        try {
            const { userId, courseId } = req.body;
            if (!userId || !courseId) {
                ResponseUtil.badRequest(res, "userId and courseId are required");
                return;
            }
            const result = await this.authService.updateUserCoursePaymentStatus(userId, courseId);
            ResponseUtil.success(res, { userCourseLiked: result }, "User course payment status updated successfully");
        }
        catch (error) {
            next(error);
        }
    };
    checkEmailAvailability = async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email) {
                ResponseUtil.badRequest(res, "Email is required");
                return;
            }
            const result = await this.authService.checkEmailAvailability(email);
            ResponseUtil.success(res, result, result.available ? "Email is available" : "Email is already taken");
        }
        catch (error) {
            next(error);
        }
    };
}
export default AuthController;
//# sourceMappingURL=AuthController.js.map