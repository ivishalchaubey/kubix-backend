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
        name: [
            { required: true, type: "string" },
            { minLength: VALIDATION_RULES.NAME.MIN_LENGTH },
            { maxLength: VALIDATION_RULES.NAME.MAX_LENGTH },
        ],
        email: [
            { required: true, type: "email" },
            { maxLength: VALIDATION_RULES.EMAIL.MAX_LENGTH },
        ],
        password: [
            { required: true, type: "string" },
            { minLength: VALIDATION_RULES.PASSWORD.MIN_LENGTH },
            { maxLength: VALIDATION_RULES.PASSWORD.MAX_LENGTH },
            { pattern: VALIDATION_RULES.PASSWORD.PATTERN },
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
        token: [{ required: true, type: "string" }],
        password: [
            { required: true, type: "string" },
            { minLength: VALIDATION_RULES.PASSWORD.MIN_LENGTH },
            { maxLength: VALIDATION_RULES.PASSWORD.MAX_LENGTH },
            { pattern: VALIDATION_RULES.PASSWORD.PATTERN },
        ],
    }),
};
export default Validator;
//# sourceMappingURL=validationMiddleware.js.map