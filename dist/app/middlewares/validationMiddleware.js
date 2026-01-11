import { VALIDATION_RULES } from "../constants/enums.js";
import ResponseUtil from "../utils/response.js";
class Validator {
    static validateField(fieldName, value, rules) {
        for (const rule of rules) {
            if (rule.required &&
                (value === undefined || value === null || value === "")) {
                return {
                    field: fieldName,
                    message: `${fieldName} is required`,
                    value,
                };
            }
            if (!rule.required &&
                (value === undefined || value === null || value === "")) {
                continue;
            }
            if (rule.type) {
                if (rule.type === "email") {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        return {
                            field: fieldName,
                            message: `${fieldName} must be a valid email`,
                            value,
                        };
                    }
                }
                else if (rule.type === "string" && typeof value !== "string") {
                    return {
                        field: fieldName,
                        message: `${fieldName} must be a string`,
                        value,
                    };
                }
                else if (rule.type === "number" && typeof value !== "number") {
                    return {
                        field: fieldName,
                        message: `${fieldName} must be a number`,
                        value,
                    };
                }
                else if (rule.type === "boolean" && typeof value !== "boolean") {
                    return {
                        field: fieldName,
                        message: `${fieldName} must be a boolean`,
                        value,
                    };
                }
            }
            if (rule.minLength && value.length < rule.minLength) {
                return {
                    field: fieldName,
                    message: `${fieldName} must be at least ${rule.minLength} characters long`,
                    value,
                };
            }
            if (rule.maxLength && value.length > rule.maxLength) {
                return {
                    field: fieldName,
                    message: `${fieldName} must not exceed ${rule.maxLength} characters`,
                    value,
                };
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                return {
                    field: fieldName,
                    message: `${fieldName} format is invalid`,
                    value,
                };
            }
            if (rule.custom) {
                const result = rule.custom(value);
                if (typeof result === "string") {
                    return {
                        field: fieldName,
                        message: result,
                        value,
                    };
                }
                else if (result === false) {
                    return {
                        field: fieldName,
                        message: `${fieldName} is invalid`,
                        value,
                    };
                }
            }
        }
        return null;
    }
    static validate(schema) {
        return (req, res, next) => {
            const errors = [];
            const data = { ...req.body, ...req.params, ...req.query };
            for (const [fieldName, rules] of Object.entries(schema)) {
                const error = this.validateField(fieldName, data[fieldName], rules);
                if (error) {
                    errors.push(error);
                }
            }
            if (data.board === "OTHER" &&
                (!data.otherBoardName || data.otherBoardName.trim() === "")) {
                errors.push({
                    field: "otherBoardName",
                    message: "otherBoardName is required when board is OTHER",
                    value: data.otherBoardName,
                });
            }
            if (data.stream === "Other" &&
                (!data.otherStreamName || data.otherStreamName.trim() === "")) {
                errors.push({
                    field: "otherStreamName",
                    message: "otherStreamName is required when stream is Other",
                    value: data.otherStreamName,
                });
            }
            if (errors.length > 0) {
                const errorMessage = errors.map((err) => err.message).join(", ");
                ResponseUtil.validationError(res, errorMessage, JSON.stringify(errors));
                return;
            }
            next();
        };
    }
}
export const authValidation = {
    register: Validator.validate({
        firstName: [
            { minLength: VALIDATION_RULES.NAME.MIN_LENGTH },
            { maxLength: VALIDATION_RULES.NAME.MAX_LENGTH },
        ],
        lastName: [
            { minLength: VALIDATION_RULES.NAME.MIN_LENGTH },
            { maxLength: VALIDATION_RULES.NAME.MAX_LENGTH },
        ],
        email: [
            { required: true, type: "email" },
        ],
        password: [
            { required: true, type: "string" },
        ],
        dob: [{ required: false, type: "string" }],
        countryCode: [{ required: false, type: "string" }],
        role: [{ required: true, type: "string" }],
        phoneNumber: [{ required: false, type: "string" }],
        board: [{ required: false, type: "string" }],
        otherBoardName: [{ required: false, type: "string" }, { maxLength: 100 }],
        stream: [{ required: false, type: "string" }],
        otherStreamName: [{ required: false, type: "string" }, { maxLength: 100 }],
        grade: [{ required: false, type: "string" }],
        yearOfPassing: [
            { required: false, type: "string" },
            { pattern: /^\d{4}$/ },
        ],
        collegeCode: [{ required: false, type: "string" }],
        profileImage: [{ type: "string" }],
        collegeName: [
            { type: "string" },
            { minLength: VALIDATION_RULES.NAME.MIN_LENGTH },
            { maxLength: VALIDATION_RULES.NAME.MAX_LENGTH },
        ],
        location: [{ type: "string" }, { maxLength: 255 }],
        address: [{ type: "string" }, { maxLength: 500 }],
        specialization: [{ type: "string" }, { maxLength: 100 }],
        description: [{ type: "string" }, { maxLength: 2000 }],
        bannerYoutubeVideoLink: [
            { type: "string" },
            { pattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/ },
        ],
        website: [{ type: "string" }, { maxLength: 500 }],
        bannerImage: [{ type: "string" }],
        state: [{ type: "string" }, { maxLength: 100 }],
        city: [{ type: "string" }, { maxLength: 100 }],
        foundedYear: [{ type: "string" }, { pattern: /^\d{4}$/ }],
        courses: [
            { required: false },
            {
                custom: (value) => {
                    if (value !== undefined && value !== null) {
                        if (!Array.isArray(value)) {
                            return "courses must be an array";
                        }
                        for (const course of value) {
                            if (!course.courseName || typeof course.courseName !== "string") {
                                return "Each course must have a courseName (string)";
                            }
                            if (!course.courseDuration ||
                                typeof course.courseDuration !== "string") {
                                return "Each course must have a courseDuration (string)";
                            }
                        }
                    }
                    return true;
                },
            },
        ],
    }),
    login: Validator.validate({
        email: [{ required: true, type: "email" }],
        password: [{ required: true, type: "string" }],
    }),
    forgotPassword: Validator.validate({
        email: [{ required: true, type: "email" }],
    }),
    resetPassword: Validator.validate({
        oldPassword: [
            { required: true, type: "string" },
            { minLength: VALIDATION_RULES.PASSWORD.MIN_LENGTH },
            { maxLength: VALIDATION_RULES.PASSWORD.MAX_LENGTH },
            { pattern: VALIDATION_RULES.PASSWORD.PATTERN },
        ],
        newPassword: [
            { required: true, type: "string" },
            { minLength: VALIDATION_RULES.PASSWORD.MIN_LENGTH },
            { maxLength: VALIDATION_RULES.PASSWORD.MAX_LENGTH },
            { pattern: VALIDATION_RULES.PASSWORD.PATTERN },
        ],
    }),
    updateUserCoursePaymentStatus: Validator.validate({
        userId: [{ required: true, type: "string" }],
        courseId: [{ required: true, type: "string" }],
    }),
};
export const notificationValidation = {
    create: Validator.validate({
        title: [
            { required: true, type: "string" },
            { minLength: 1, maxLength: 200 },
        ],
        content: [
            { required: true, type: "string" },
            { minLength: 1, maxLength: 1000 },
        ],
        datetime: [
            {
                required: false,
                custom: (value) => {
                    if (value && isNaN(Date.parse(value))) {
                        return "datetime must be a valid date";
                    }
                    return true;
                },
            },
        ],
        isSentToAll: [{ required: false, type: "boolean" }],
        userId: [{ required: false, type: "string" }],
    }),
    update: Validator.validate({
        title: [
            { required: false, type: "string" },
            { minLength: 1, maxLength: 200 },
        ],
        content: [
            { required: false, type: "string" },
            { minLength: 1, maxLength: 1000 },
        ],
        datetime: [
            {
                required: false,
                custom: (value) => {
                    if (value && isNaN(Date.parse(value))) {
                        return "datetime must be a valid date";
                    }
                    return true;
                },
            },
        ],
        isSentToAll: [{ required: false, type: "boolean" }],
        userId: [{ required: false, type: "string" }],
    }),
};
export const inAppBannerValidation = {
    create: Validator.validate({
        title: [
            { required: true, type: "string" },
            { minLength: 1, maxLength: 200 },
        ],
        description: [
            { required: true, type: "string" },
            { minLength: 1, maxLength: 1000 },
        ],
        imageUrl: [{ required: false, type: "string" }],
        actionUrl: [{ required: false, type: "string" }],
        priority: [
            { required: false, type: "number" },
            {
                custom: (value) => {
                    if (value !== undefined && (value < 0 || value > 100)) {
                        return "Priority must be between 0 and 100";
                    }
                    return true;
                },
            },
        ],
        isActive: [{ required: false, type: "boolean" }],
        startDate: [
            {
                required: false,
                custom: (value) => {
                    if (value && isNaN(Date.parse(value))) {
                        return "startDate must be a valid date";
                    }
                    return true;
                },
            },
        ],
        endDate: [
            {
                required: false,
                custom: (value) => {
                    if (value && isNaN(Date.parse(value))) {
                        return "endDate must be a valid date";
                    }
                    return true;
                },
            },
        ],
    }),
    update: Validator.validate({
        title: [
            { required: false, type: "string" },
            { minLength: 1, maxLength: 200 },
        ],
        description: [
            { required: false, type: "string" },
            { minLength: 1, maxLength: 1000 },
        ],
        imageUrl: [{ required: false, type: "string" }],
        actionUrl: [{ required: false, type: "string" }],
        priority: [
            { required: false, type: "number" },
            {
                custom: (value) => {
                    if (value !== undefined && (value < 0 || value > 100)) {
                        return "Priority must be between 0 and 100";
                    }
                    return true;
                },
            },
        ],
        isActive: [{ required: false, type: "boolean" }],
        startDate: [
            {
                required: false,
                custom: (value) => {
                    if (value && isNaN(Date.parse(value))) {
                        return "startDate must be a valid date";
                    }
                    return true;
                },
            },
        ],
        endDate: [
            {
                required: false,
                custom: (value) => {
                    if (value && isNaN(Date.parse(value))) {
                        return "endDate must be a valid date";
                    }
                    return true;
                },
            },
        ],
    }),
};
export const webinarValidation = {
    create: Validator.validate({
        universityName: [
            { required: true, type: "string" },
            { minLength: 2, maxLength: 200 },
        ],
        title: [
            { required: true, type: "string" },
            { minLength: 1, maxLength: 200 },
        ],
        description: [
            { required: true, type: "string" },
            { minLength: 1, maxLength: 2000 },
        ],
        courseDetails: [{ required: true, type: "string" }],
        targetAudience: [{ required: true, type: "string" }],
        tags: [{ required: false }],
        domains: [{ required: false }],
        speakerName: [{ required: true, type: "string" }],
        speakerPhoto: [{ required: false, type: "string" }],
        speakerBio: [{ required: false, type: "string" }, { maxLength: 1000 }],
        scheduledDate: [
            {
                required: true,
                custom: (value) => {
                    if (value && isNaN(Date.parse(value))) {
                        return "scheduledDate must be a valid date";
                    }
                    return true;
                },
            },
        ],
        scheduledTime: [{ required: true, type: "string" }],
        duration: [
            { required: true, type: "number" },
            {
                custom: (value) => {
                    if (value && (value < 15 || value > 300)) {
                        return "Duration must be between 15 and 300 minutes";
                    }
                    return true;
                },
            },
        ],
        webinarLink: [{ required: true, type: "string" }],
        pocName: [{ required: true, type: "string" }],
        pocPhone: [{ required: true, type: "string" }],
        pocEmail: [{ required: true, type: "email" }],
        admissionChairperson: [{ required: false, type: "string" }],
        freebies: [{ required: false }],
        logo: [{ required: false, type: "string" }],
    }),
    update: Validator.validate({
        universityName: [
            { required: false, type: "string" },
            { minLength: 2, maxLength: 200 },
        ],
        title: [
            { required: false, type: "string" },
            { minLength: 1, maxLength: 200 },
        ],
        description: [
            { required: false, type: "string" },
            { minLength: 1, maxLength: 2000 },
        ],
        courseDetails: [{ required: false, type: "string" }],
        targetAudience: [{ required: false, type: "string" }],
        tags: [{ required: false }],
        domains: [{ required: false }],
        speakerName: [{ required: false, type: "string" }],
        speakerPhoto: [{ required: false, type: "string" }],
        speakerBio: [{ required: false, type: "string" }, { maxLength: 1000 }],
        scheduledDate: [
            {
                required: false,
                custom: (value) => {
                    if (value && isNaN(Date.parse(value))) {
                        return "scheduledDate must be a valid date";
                    }
                    return true;
                },
            },
        ],
        scheduledTime: [{ required: false, type: "string" }],
        duration: [
            { required: false, type: "number" },
            {
                custom: (value) => {
                    if (value && (value < 15 || value > 300)) {
                        return "Duration must be between 15 and 300 minutes";
                    }
                    return true;
                },
            },
        ],
        webinarLink: [{ required: false, type: "string" }],
        pocName: [{ required: false, type: "string" }],
        pocPhone: [{ required: false, type: "string" }],
        pocEmail: [{ required: false, type: "email" }],
        admissionChairperson: [{ required: false, type: "string" }],
        freebies: [{ required: false }],
        logo: [{ required: false, type: "string" }],
        status: [
            { required: false, type: "string" },
            {
                custom: (value) => {
                    const validValues = [
                        "draft",
                        "published",
                        "live",
                        "completed",
                        "cancelled",
                    ];
                    if (value && !validValues.includes(value)) {
                        return "status must be one of: draft, published, live, completed, cancelled";
                    }
                    return true;
                },
            },
        ],
    }),
};
export const applicationSalesValidation = {
    create: Validator.validate({
        universityName: [
            { required: true, type: "string" },
            { minLength: 2, maxLength: 200 },
        ],
        applicationFormLink: [{ required: true, type: "string" }],
        paymentLink: [{ required: true, type: "string" }],
        pocName: [{ required: true, type: "string" }],
        pocPhone: [{ required: true, type: "string" }],
        pocEmail: [{ required: true, type: "email" }],
        admissionChairperson: [{ required: false, type: "string" }],
        freebies: [{ required: false }],
    }),
    update: Validator.validate({
        universityName: [
            { required: false, type: "string" },
            { minLength: 2, maxLength: 200 },
        ],
        applicationFormLink: [{ required: false, type: "string" }],
        paymentLink: [{ required: false, type: "string" }],
        pocName: [{ required: false, type: "string" }],
        pocPhone: [{ required: false, type: "string" }],
        pocEmail: [{ required: false, type: "email" }],
        admissionChairperson: [{ required: false, type: "string" }],
        freebies: [{ required: false }],
        status: [
            { required: false, type: "string" },
            {
                custom: (value) => {
                    const validValues = ["draft", "published", "active", "closed"];
                    if (value && !validValues.includes(value)) {
                        return "status must be one of: draft, published, active, closed";
                    }
                    return true;
                },
            },
        ],
    }),
};
export default Validator;
//# sourceMappingURL=validationMiddleware.js.map