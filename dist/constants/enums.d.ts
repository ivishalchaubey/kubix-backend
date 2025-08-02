export { UserRole, TokenType, HttpStatus } from "../types/global.js";
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
        readonly NOT_FOUND: "Resource not found";
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