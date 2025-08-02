import { Request, Response, NextFunction } from "express";
import { CustomError } from "../types/global.js";
declare class AppError extends Error implements CustomError {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number);
}
declare const globalErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => void;
export { AppError };
export default globalErrorHandler;
//# sourceMappingURL=errorHandler.d.ts.map