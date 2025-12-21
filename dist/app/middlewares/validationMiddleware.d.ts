import { Request, Response, NextFunction } from "express";
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
declare class Validator {
    private static validateField;
    static validate(schema: ValidationSchema): (req: Request, res: Response, next: NextFunction) => void;
}
export declare const authValidation: {
    register: (req: Request, res: Response, next: NextFunction) => void;
    login: (req: Request, res: Response, next: NextFunction) => void;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
    resetPassword: (req: Request, res: Response, next: NextFunction) => void;
    updateUserCoursePaymentStatus: (req: Request, res: Response, next: NextFunction) => void;
};
export declare const notificationValidation: {
    create: (req: Request, res: Response, next: NextFunction) => void;
    update: (req: Request, res: Response, next: NextFunction) => void;
};
export declare const inAppBannerValidation: {
    create: (req: Request, res: Response, next: NextFunction) => void;
    update: (req: Request, res: Response, next: NextFunction) => void;
};
export declare const webinarValidation: {
    create: (req: Request, res: Response, next: NextFunction) => void;
    update: (req: Request, res: Response, next: NextFunction) => void;
};
export declare const applicationSalesValidation: {
    create: (req: Request, res: Response, next: NextFunction) => void;
    update: (req: Request, res: Response, next: NextFunction) => void;
};
export default Validator;
//# sourceMappingURL=validationMiddleware.d.ts.map