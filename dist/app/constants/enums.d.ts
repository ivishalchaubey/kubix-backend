export declare enum UserRole {
    ADMIN = "admin",
    User = "user",
    STUDENT = "student"
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
    INTERNAL_SERVER_ERROR = 500
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
    };
    readonly ADMIN_SUCCESS: {
        readonly CATEGORY_CREATED: "Category created successfully";
        readonly CATEGORY_UPDATED: "Category updated successfully";
        readonly CATEGORY_DELETED: "Category deleted successfully";
        readonly CATEGORIES_FETCHED: "Categories fetched successfully";
        readonly CATEGORY_FETCHED: "Category fetched successfully";
    };
    readonly ERROR: {
        readonly USER_NOT_FOUND: "User not found";
        readonly INVALID_CREDENTIALS: "Invalid email or password";
        readonly EMAIL_ALREADY_EXISTS: "Email already exists";
        readonly INVALID_TOKEN: "Invalid or expired token";
        readonly ACCESS_DENIED: "Access denied";
        readonly VALIDATION_ERROR: "Validation error";
        readonly INTERNAL_SERVER_ERROR: "Internal server error";
        readonly UNAUTHORIZED: "Unauthorized access";
        readonly FORBIDDEN: "Forbidden access";
        readonly RESOURCE_: "Resource not found";
        readonly INVALID_ROLE: "Invalid user role";
        readonly EMAIL_NOT_VERIFIED: "Email not verified";
        readonly NOT_FOUND: "Resource not found";
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