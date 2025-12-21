export declare enum UserRole {
    ADMIN = "admin",
    USER = "user",
    UNIVERSITY = "university"
}
export declare enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
    RESET_PASSWORD = "resetPassword",
    VERIFY_EMAIL = "verifyEmail"
}
export declare enum HttpStatus {
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
    SERVICE_UNAVAILABLE = 503
}
export declare const API_MESSAGES: {
    readonly SUCCESS: {
        readonly USER_CREATED: "User created successfully";
        readonly USER_UPDATED: "User updated successfully";
        readonly USER_DELETED: "User deleted successfully";
        readonly LOGIN_SUCCESS: "Login successful";
        readonly LOGOUT_SUCCESS: "Logout successful";
        readonly PASSWORD_RESET_SENT: "Password reset email sent";
        readonly PASSWORD_RESET_SUCCESS: "Password reset successful";
        readonly EMAIL_VERIFIED: "Email verified successfully";
        readonly AWS_FILE_UPLOADED: "File uploaded successfully";
    };
    readonly ADMIN_SUCCESS: {
        readonly CATEGORY_CREATED: "Category created successfully";
        readonly CATEGORY_UPDATED: "Category updated successfully";
        readonly CATEGORY_DELETED: "Category deleted successfully";
        readonly CATEGORIES_FETCHED: "Categories fetched successfully";
        readonly CATEGORY_FETCHED: "Category fetched successfully";
    };
    readonly USER: {
        readonly User_CREATED: "User created successfully";
        readonly User_UPDATED: "User updated successfully";
        readonly User_DELETED: "User deleted successfully";
        readonly UserS_FETCHED: "Users fetched successfully";
        readonly COURSE_LIKED: "Course liked successfully";
        readonly LIKED_COURSES_FETCHED: "Liked courses fetched successfully";
        readonly BOOKMARKED_COURSES_FETCHED: "Bookmarked courses fetched successfully";
        readonly TOKEN_UPDATED: "Token updated successfully";
        readonly HOME_DATA_FETCHED: "Home data fetched successfully";
    };
    readonly USER_ERROR: {
        readonly USER_NOT_FOUND: "User not found";
        readonly INVALID_CREDENTIALS: "Invalid email or password";
        readonly EMAIL_ALREADY_EXISTS: "Email already exists";
    };
    readonly COURSE: {
        readonly COURSE_CREATED: "Course created successfully";
        readonly COURSE_UPDATED: "Course updated successfully";
        readonly COURSE_DELETED: "Course deleted successfully";
        readonly COURSES_FETCHED: "Courses fetched successfully";
    };
    readonly NOTIFICATION: {
        readonly NOTIFICATION_CREATED: "Notification created successfully";
        readonly NOTIFICATION_UPDATED: "Notification updated successfully";
        readonly NOTIFICATION_DELETED: "Notification deleted successfully";
        readonly NOTIFICATIONS_FETCHED: "Notifications fetched successfully";
        readonly NOTIFICATION_FETCHED: "Notification fetched successfully";
    };
    readonly IN_APP_BANNER: {
        readonly BANNER_CREATED: "Banner created successfully";
        readonly BANNER_UPDATED: "Banner updated successfully";
        readonly BANNER_DELETED: "Banner deleted successfully";
        readonly BANNERS_FETCHED: "Banners fetched successfully";
        readonly BANNER_FETCHED: "Banner fetched successfully";
        readonly ACTIVE_BANNERS_FETCHED: "Active banners fetched successfully";
        readonly BANNER_NOT_FOUND: "Banner not found";
    };
    readonly WEBINAR: {
        readonly WEBINAR_CREATED: "Webinar created successfully";
        readonly WEBINAR_UPDATED: "Webinar updated successfully";
        readonly WEBINAR_DELETED: "Webinar deleted successfully";
        readonly WEBINARS_FETCHED: "Webinars fetched successfully";
        readonly WEBINAR_FETCHED: "Webinar fetched successfully";
        readonly WEBINAR_PUBLISHED: "Webinar published successfully. 5000 KX coins deducted";
        readonly WEBINAR_NOT_FOUND: "Webinar not found";
    };
    readonly APPLICATION_SALES: {
        readonly CREATED: "Application sale created successfully";
        readonly UPDATED: "Application sale updated successfully";
        readonly DELETED: "Application sale deleted successfully";
        readonly FETCHED: "Application sale fetched successfully";
        readonly FETCHED_ALL: "Application sales fetched successfully";
        readonly PUBLISHED: "Application sale published successfully";
        readonly NOT_FOUND: "Application sale not found";
        readonly APPLICATION_TRACKED: "Application tracked successfully. 3000 KX coins credited";
    };
    readonly SHORTLIST: {
        readonly ITEM_SHORTLISTED: "Item shortlisted successfully";
        readonly ITEM_REMOVED: "Item removed from shortlist successfully";
        readonly SHORTLISTS_FETCHED: "Shortlisted items fetched successfully";
        readonly SHORTLIST_FETCHED: "Shortlist item fetched successfully";
        readonly SHORTLIST_DELETED: "Shortlist item deleted successfully";
        readonly SHORTLIST_NOT_FOUND: "Shortlist item not found";
        readonly CATEGORY_NOT_FOUND: "Category not found";
        readonly UNIVERSITY_NOT_FOUND: "University not found";
        readonly COURSE_NOT_FOUND: "Course not found";
        readonly INVALID_ITEM_TYPE: "Invalid item type. Must be 'career', 'colleges', or 'course'";
        readonly CHECK_SUCCESS: "Shortlist status checked successfully";
    };
    readonly APPLICATION_FORM: {
        readonly APPLICATION_CREATED_OR_UPDATED: "Application form created/updated successfully";
        readonly APPLICATION_FETCHED: "Application form fetched successfully";
        readonly APPLICATIONS_FETCHED: "Applications fetched successfully";
        readonly APPLICATION_DELETED: "Application form deleted successfully";
        readonly APPLICATION_NOT_FOUND: "Application form not found";
        readonly COLLEGE_NOT_FOUND: "College not found";
        readonly TWELFTH_FIELDS_REQUIRED: "If twelfthStatus is provided, twelfthPercentage, twelfthSchoolName, passingYear, and twelfthMarksheet are required";
        readonly INVALID_EMAIL: "Invalid email format";
        readonly INVALID_DATE_FORMAT: "Invalid date format. Use YYYY-MM-DD format";
    };
    readonly ERROR: {
        readonly USER_NOT_FOUND: "User not found";
        readonly INVALID_CREDENTIALS: "Invalid email or password";
        readonly INVALID_INPUT: "Invalid input data";
        readonly EMAIL_ALREADY_EXISTS: "Email already exists";
        readonly INVALID_TOKEN: "Invalid or expired token";
        readonly FILE_NOT_PROVIDED: "File not provided";
        readonly ACCESS_DENIED: "Access denied";
        readonly VALIDATION_ERROR: "Validation error";
        readonly INTERNAL_SERVER_ERROR: "Internal server error";
        readonly UNAUTHORIZED: "Unauthorized access";
        readonly ACCESSDENIED: "Access Denied";
        readonly FORBIDDEN: "Forbidden access";
        readonly RESOURCE_: "Resource not found";
        readonly INVALID_ROLE: "Invalid user role";
        readonly EMAIL_NOT_VERIFIED: "Email not verified";
        readonly NOT_FOUND: "Resource not found";
        readonly UNPROCESSABLE_ENTITY: "Unprocessable entity";
        readonly INVALID_OTP: "Invalid OTP";
        readonly OTP_EXPIRED: "OTP has expired";
        readonly UNIVERSITY_NOT_FOUND: "University not found";
        readonly INCORRECT_CURRENT_PASSWORD: "Incorrect current password";
        readonly INVALID_REFRESH_TOKEN: "Invalid refresh token";
    };
    readonly ADMIN_ERROR: {
        readonly CATEGORY_NOT_FOUND: "Category not found";
    };
};
export declare const VALIDATION_RULES: {
    readonly PASSWORD: {
        readonly MIN_LENGTH: 8;
        readonly MAX_LENGTH: 128;
        readonly PATTERN: RegExp;
    };
    readonly NAME: {
        readonly MIN_LENGTH: 2;
        readonly MAX_LENGTH: 50;
    };
    readonly EMAIL: {
        readonly MAX_LENGTH: 254;
    };
};
export declare const TOKEN_EXPIRES: {
    readonly ACCESS_TOKEN: "15m";
    readonly REFRESH_TOKEN: "7d";
    readonly RESET_PASSWORD_TOKEN: "10m";
    readonly VERIFY_EMAIL_TOKEN: "24h";
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 10;
    readonly MAX_LIMIT: 100;
};
//# sourceMappingURL=enums.d.ts.map