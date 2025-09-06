// Enums
export enum   UserRole {
  ADMIN = "admin",
  USER = "user",
  UNIVERSITY = "university",
}

export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  RESET_PASSWORD = "resetPassword",
  VERIFY_EMAIL = "verifyEmail",
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

// API Constants
export const API_MESSAGES = {
  SUCCESS: {
    USER_CREATED: "User created successfully",
    USER_UPDATED: "User updated successfully",
    USER_DELETED: "User deleted successfully",
    LOGIN_SUCCESS: "Login successful",
    LOGOUT_SUCCESS: "Logout successful",
    PASSWORD_RESET_SENT: "Password reset email sent",
    PASSWORD_RESET_SUCCESS: "Password reset successful",
    EMAIL_VERIFIED: "Email verified successfully",
    AWS_FILE_UPLOADED: "File uploaded successfully",
  },
  ADMIN_SUCCESS:{
    CATEGORY_CREATED: "Category created successfully",
    CATEGORY_UPDATED: "Category updated successfully",
    CATEGORY_DELETED: "Category deleted successfully",
    CATEGORIES_FETCHED: "Categories fetched successfully",
    CATEGORY_FETCHED: "Category fetched successfully",
  },
  USER: {
    User_CREATED: "User created successfully",
    User_UPDATED: "User updated successfully",
    User_DELETED: "User deleted successfully",
    UserS_FETCHED: "Users fetched successfully",
    COURSE_LIKED: "Course liked successfully",
    LIKED_COURSES_FETCHED: "Liked courses fetched successfully",  
    BOOKMARKED_COURSES_FETCHED: "Bookmarked courses fetched successfully",
    TOKEN_UPDATED: "Token updated successfully",
  },
  USER_ERROR: {
    USER_NOT_FOUND: "User not found",
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_ALREADY_EXISTS: "Email already exists",
  },
  COURSE:{
    COURSE_CREATED: "Course created successfully",
    COURSE_UPDATED: "Course updated successfully",
    COURSE_DELETED: "Course deleted successfully",
    COURSES_FETCHED: "Courses fetched successfully",
  },
  NOTIFICATION:{
    NOTIFICATION_CREATED: "Notification created successfully",
    NOTIFICATION_UPDATED: "Notification updated successfully",
    NOTIFICATION_DELETED: "Notification deleted successfully",
    NOTIFICATIONS_FETCHED: "Notifications fetched successfully",
    NOTIFICATION_FETCHED: "Notification fetched successfully",
  },
  ERROR: {
    USER_NOT_FOUND: "User not found",
    INVALID_CREDENTIALS: "Invalid email or password",
    INVALID_INPUT: "Invalid input data",
    EMAIL_ALREADY_EXISTS: "Email already exists",
    INVALID_TOKEN: "Invalid or expired token",
    FILE_NOT_PROVIDED: "File not provided",
    ACCESS_DENIED: "Access denied",
    VALIDATION_ERROR: "Validation error",
    INTERNAL_SERVER_ERROR: "Internal server error",
    UNAUTHORIZED: "Unauthorized access",
    ACCESSDENIED: "Access Denied",
    FORBIDDEN: "Forbidden access",
    RESOURCE_: "Resource not found",
    INVALID_ROLE: "Invalid user role",
    EMAIL_NOT_VERIFIED: "Email not verified",
    NOT_FOUND: "Resource not found",
    UNPROCESSABLE_ENTITY: "Unprocessable entity",
    INVALID_OTP: "Invalid OTP",
    OTP_EXPIRED: "OTP has expired",
    UNIVERSITY_NOT_FOUND: "University not found",
  },
  ADMIN_ERROR: {
    CATEGORY_NOT_FOUND: "Category not found",
  },
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
} as const;

// Token Constants
export const TOKEN_EXPIRES = {
  ACCESS_TOKEN: "15m",
  REFRESH_TOKEN: "7d",
  RESET_PASSWORD_TOKEN: "10m",
  VERIFY_EMAIL_TOKEN: "24h",
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
