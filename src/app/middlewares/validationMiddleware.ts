import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../types/global.js";
import { VALIDATION_RULES } from "../constants/enums.js";
import ResponseUtil from "../utils/response.js";

interface ValidationSchema {
  [key: string]: ValidationRule[];
}

interface ValidationRule {
  required?: boolean;
  type?: "string" | "number" | "boolean" | "email";
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

class Validator {
  private static validateField(
    fieldName: string,
    value: any,
    rules: ValidationRule[]
  ): ValidationError | null {
    for (const rule of rules) {
      // Required validation
      if (
        rule.required &&
        (value === undefined || value === null || value === "")
      ) {
        return {
          field: fieldName,
          message: `${fieldName} is required`,
          value,
        };
      }

      // Skip other validations if value is empty and not required
      if (
        !rule.required &&
        (value === undefined || value === null || value === "")
      ) {
        continue;
      }

      // Type validation
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
        } else if (rule.type === "string" && typeof value !== "string") {
          return {
            field: fieldName,
            message: `${fieldName} must be a string`,
            value,
          };
        } else if (rule.type === "number" && typeof value !== "number") {
          return {
            field: fieldName,
            message: `${fieldName} must be a number`,
            value,
          };
        } else if (rule.type === "boolean" && typeof value !== "boolean") {
          return {
            field: fieldName,
            message: `${fieldName} must be a boolean`,
            value,
          };
        }
      }

      // Length validations
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

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return {
          field: fieldName,
          message: `${fieldName} format is invalid`,
          value,
        };
      }

      // Custom validation
      if (rule.custom) {
        const result = rule.custom(value);
        if (typeof result === "string") {
          return {
            field: fieldName,
            message: result,
            value,
          };
        } else if (result === false) {
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

  static validate(schema: ValidationSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const errors: ValidationError[] = [];
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

// Common validation schemas
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
      { maxLength: VALIDATION_RULES.EMAIL.MAX_LENGTH },
    ],
    password: [
      { required: true, type: "string" },
      { minLength: VALIDATION_RULES.PASSWORD.MIN_LENGTH },
      { maxLength: VALIDATION_RULES.PASSWORD.MAX_LENGTH },
      { pattern: VALIDATION_RULES.PASSWORD.PATTERN },
    ],
    dob: [{ required: false, type: "string" }], // Assuming dob is a string in ISO format
    countryCode: [{ required: true, type: "string" }],
    role: [{ required: true, type: "string" }], // Assuming role is a string
    phoneNumber: [{ required: true, type: "string" }],
    board: [{ required: false, type: "string" }],
    stream: [{ required: false, type: "string" }],
    collegeCode: [{ required: false, type: "string" }],
    profileImage: [{ type: "string" }],

    collegeName: [
      { type: "string" },
      { minLength: VALIDATION_RULES.NAME.MIN_LENGTH },
      { maxLength: VALIDATION_RULES.NAME.MAX_LENGTH },
    ],

    location: [
      { type: "string" },
      { maxLength: 255 },
    ],

    address: [
      { type: "string" },
      { maxLength: 500 },
    ],

    specialization: [
      { type: "string" },
      { maxLength: 100 },
    ],

    description: [
      { type: "string" },
      { maxLength: 2000 },
    ],

    bannerYoutubeVideoLink: [
      { type: "string" },
      { pattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/ },
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

  updateUserCoursePaymentStatus: Validator.validate({
    userId: [{ required: true, type: "string" }],
    courseId: [{ required: true, type: "string" }],
  }),
};

// Notification validation schemas
export const notificationValidation = {
  create: Validator.validate({
    title: [
      { required: true, type: "string" },
      { minLength: 1, maxLength: 200 }
    ],
    content: [
      { required: true, type: "string" },
      { minLength: 1, maxLength: 1000 }
    ],
    datetime: [
      { 
        required: false, 
        custom: (value: any) => {
          if (value && isNaN(Date.parse(value))) {
            return "datetime must be a valid date";
          }
          return true;
        }
      }
    ],
    isSentToAll: [
      { required: false, type: "boolean" }
    ],
    userId: [
      { required: false, type: "string" }
    ]
  }),

  update: Validator.validate({
    title: [
      { required: false, type: "string" },
      { minLength: 1, maxLength: 200 }
    ],
    content: [
      { required: false, type: "string" },
      { minLength: 1, maxLength: 1000 }
    ],
    datetime: [
      { 
        required: false, 
        custom: (value: any) => {
          if (value && isNaN(Date.parse(value))) {
            return "datetime must be a valid date";
          }
          return true;
        }
      }
    ],
    isSentToAll: [
      { required: false, type: "boolean" }
    ],
    userId: [
      { required: false, type: "string" }
    ]
  })
};

// In-app banner validation schemas
export const inAppBannerValidation = {
  create: Validator.validate({
    title: [
      { required: true, type: "string" },
      { minLength: 1, maxLength: 200 }
    ],
    description: [
      { required: true, type: "string" },
      { minLength: 1, maxLength: 1000 }
    ],
    imageUrl: [
      { required: false, type: "string" }
    ],
    actionUrl: [
      { required: false, type: "string" }
    ],
    priority: [
      { required: false, type: "number" },
      { 
        custom: (value: any) => {
          if (value !== undefined && (value < 0 || value > 100)) {
            return "Priority must be between 0 and 100";
          }
          return true;
        }
      }
    ],
    isActive: [
      { required: false, type: "boolean" }
    ],
    startDate: [
      { 
        required: false, 
        custom: (value: any) => {
          if (value && isNaN(Date.parse(value))) {
            return "startDate must be a valid date";
          }
          return true;
        }
      }
    ],
    endDate: [
      { 
        required: false, 
        custom: (value: any) => {
          if (value && isNaN(Date.parse(value))) {
            return "endDate must be a valid date";
          }
          return true;
        }
      }
    ]
  }),

  update: Validator.validate({
    title: [
      { required: false, type: "string" },
      { minLength: 1, maxLength: 200 }
    ],
    description: [
      { required: false, type: "string" },
      { minLength: 1, maxLength: 1000 }
    ],
    imageUrl: [
      { required: false, type: "string" }
    ],
    actionUrl: [
      { required: false, type: "string" }
    ],
    priority: [
      { required: false, type: "number" },
      { 
        custom: (value: any) => {
          if (value !== undefined && (value < 0 || value > 100)) {
            return "Priority must be between 0 and 100";
          }
          return true;
        }
      }
    ],
    isActive: [
      { required: false, type: "boolean" }
    ],
    startDate: [
      { 
        required: false, 
        custom: (value: any) => {
          if (value && isNaN(Date.parse(value))) {
            return "startDate must be a valid date";
          }
          return true;
        }
      }
    ],
    endDate: [
      { 
        required: false, 
        custom: (value: any) => {
          if (value && isNaN(Date.parse(value))) {
            return "endDate must be a valid date";
          }
          return true;
        }
      }
    ]
  })
};

// Webinar validation schemas
export const webinarValidation = {
  create: Validator.validate({
    universityName: [
      { required: true, type: "string" },
      { minLength: 2, maxLength: 200 }
    ],
    title: [
      { required: true, type: "string" },
      { minLength: 1, maxLength: 200 }
    ],
    description: [
      { required: true, type: "string" },
      { minLength: 1, maxLength: 2000 }
    ],
    courseDetails: [
      { required: true, type: "string" }
    ],
    targetAudience: [
      { required: true, type: "string" }
    ],
    tags: [
      { required: false }
    ],
    domains: [
      { required: false }
    ],
    speakerName: [
      { required: true, type: "string" }
    ],
    speakerPhoto: [
      { required: false, type: "string" }
    ],
    speakerBio: [
      { required: false, type: "string" },
      { maxLength: 1000 }
    ],
    scheduledDate: [
      { 
        required: true, 
        custom: (value: any) => {
          if (value && isNaN(Date.parse(value))) {
            return "scheduledDate must be a valid date";
          }
          return true;
        }
      }
    ],
    scheduledTime: [
      { required: true, type: "string" }
    ],
    duration: [
      { required: true, type: "number" },
      {
        custom: (value: any) => {
          if (value && (value < 15 || value > 300)) {
            return "Duration must be between 15 and 300 minutes";
          }
          return true;
        }
      }
    ],
    webinarLink: [
      { required: true, type: "string" }
    ],
    pocName: [
      { required: true, type: "string" }
    ],
    pocPhone: [
      { required: true, type: "string" }
    ],
    pocEmail: [
      { required: true, type: "email" }
    ],
    admissionChairperson: [
      { required: false, type: "string" }
    ],
    freebies: [
      { required: false }
    ],
    logo: [
      { required: false, type: "string" }
    ]
  }),

  update: Validator.validate({
    universityName: [
      { required: false, type: "string" },
      { minLength: 2, maxLength: 200 }
    ],
    title: [
      { required: false, type: "string" },
      { minLength: 1, maxLength: 200 }
    ],
    description: [
      { required: false, type: "string" },
      { minLength: 1, maxLength: 2000 }
    ],
    courseDetails: [
      { required: false, type: "string" }
    ],
    targetAudience: [
      { required: false, type: "string" }
    ],
    tags: [
      { required: false }
    ],
    domains: [
      { required: false }
    ],
    speakerName: [
      { required: false, type: "string" }
    ],
    speakerPhoto: [
      { required: false, type: "string" }
    ],
    speakerBio: [
      { required: false, type: "string" },
      { maxLength: 1000 }
    ],
    scheduledDate: [
      { 
        required: false, 
        custom: (value: any) => {
          if (value && isNaN(Date.parse(value))) {
            return "scheduledDate must be a valid date";
          }
          return true;
        }
      }
    ],
    scheduledTime: [
      { required: false, type: "string" }
    ],
    duration: [
      { required: false, type: "number" },
      {
        custom: (value: any) => {
          if (value && (value < 15 || value > 300)) {
            return "Duration must be between 15 and 300 minutes";
          }
          return true;
        }
      }
    ],
    webinarLink: [
      { required: false, type: "string" }
    ],
    pocName: [
      { required: false, type: "string" }
    ],
    pocPhone: [
      { required: false, type: "string" }
    ],
    pocEmail: [
      { required: false, type: "email" }
    ],
    admissionChairperson: [
      { required: false, type: "string" }
    ],
    freebies: [
      { required: false }
    ],
    logo: [
      { required: false, type: "string" }
    ],
    status: [
      { required: false, type: "string" },
      {
        custom: (value: any) => {
          const validValues = ["draft", "published", "live", "completed", "cancelled"];
          if (value && !validValues.includes(value)) {
            return "status must be one of: draft, published, live, completed, cancelled";
          }
          return true;
        }
      }
    ]
  })
};

export default Validator;
