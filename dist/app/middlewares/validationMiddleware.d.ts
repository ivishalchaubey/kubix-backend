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
};
export default Validator;
//# sourceMappingURL=validationMiddleware.d.ts.map