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
  SERVICE_UNAVAILABLE = 503,
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
    HOME_DATA_FETCHED: "Home data fetched successfully",
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
  IN_APP_BANNER:{
    BANNER_CREATED: "Banner created successfully",
    BANNER_UPDATED: "Banner updated successfully",
    BANNER_DELETED: "Banner deleted successfully",
    BANNERS_FETCHED: "Banners fetched successfully",
    BANNER_FETCHED: "Banner fetched successfully",
    ACTIVE_BANNERS_FETCHED: "Active banners fetched successfully",
    BANNER_NOT_FOUND: "Banner not found",
  },
  WEBINAR:{
    WEBINAR_CREATED: "Webinar created successfully",
    WEBINAR_UPDATED: "Webinar updated successfully",
    WEBINAR_DELETED: "Webinar deleted successfully",
    WEBINARS_FETCHED: "Webinars fetched successfully",
    WEBINAR_FETCHED: "Webinar fetched successfully",
    WEBINAR_PUBLISHED: "Webinar published successfully. 5000 KX coins deducted",
    WEBINAR_NOT_FOUND: "Webinar not found",
  },
  APPLICATION_SALES:{
    CREATED: "Application sale created successfully",
    UPDATED: "Application sale updated successfully",
    DELETED: "Application sale deleted successfully",
    FETCHED: "Application sale fetched successfully",
    FETCHED_ALL: "Application sales fetched successfully",
    PUBLISHED: "Application sale published successfully",
    NOT_FOUND: "Application sale not found",
    APPLICATION_TRACKED: "Application tracked successfully. 3000 KX coins credited",
  },
  SHORTLIST:{
    ITEM_SHORTLISTED: "Item shortlisted successfully",
    ITEM_REMOVED: "Item removed from shortlist successfully",
    SHORTLISTS_FETCHED: "Shortlisted items fetched successfully",
    SHORTLIST_FETCHED: "Shortlist item fetched successfully",
    SHORTLIST_DELETED: "Shortlist item deleted successfully",
    SHORTLIST_NOT_FOUND: "Shortlist item not found",
    CATEGORY_NOT_FOUND: "Category not found",
    UNIVERSITY_NOT_FOUND: "University not found",
    COURSE_NOT_FOUND: "Course not found",
    INVALID_ITEM_TYPE: "Invalid item type. Must be 'career', 'colleges', or 'course'",
    CHECK_SUCCESS: "Shortlist status checked successfully",
  },
  APPLICATION_FORM:{
    APPLICATION_CREATED_OR_UPDATED: "Application form created/updated successfully",
    APPLICATION_FETCHED: "Application form fetched successfully",
    APPLICATIONS_FETCHED: "Applications fetched successfully",
    APPLICATION_DELETED: "Application form deleted successfully",
    APPLICATION_NOT_FOUND: "Application form not found",
    COLLEGE_NOT_FOUND: "College not found",
    TWELFTH_FIELDS_REQUIRED: "If twelfthStatus is provided, twelfthPercentage, twelfthSchoolName, passingYear, and twelfthMarksheet are required",
    INVALID_EMAIL: "Invalid email format",
    INVALID_DATE_FORMAT: "Invalid date format. Use YYYY-MM-DD format",
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
    INCORRECT_CURRENT_PASSWORD: "Incorrect current password",
    INVALID_REFRESH_TOKEN: "Invalid refresh token",
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
