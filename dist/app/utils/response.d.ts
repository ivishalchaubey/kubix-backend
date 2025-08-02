import { Response } from "express";
import { ApiResponse, PaginatedResponse, PaginationMeta } from "../types/global.js";
import { HttpStatus } from "../constants/enums.js";
declare class ResponseUtil {
    static success<T>(res: Response, data: T, message?: string, statusCode?: HttpStatus): Response<ApiResponse<T>>;
    static error(res: Response, message?: string, statusCode?: HttpStatus, error?: string): Response<ApiResponse>;
    static paginated<T>(res: Response, data: T[], meta: PaginationMeta, message?: string, statusCode?: HttpStatus): Response<PaginatedResponse<T>>;
    static created<T>(res: Response, data: T, message?: string): Response<ApiResponse<T>>;
    static noContent(res: Response): Response;
    static badRequest(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static unauthorized(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static forbidden(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static notFound(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static conflict(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static validationError(res: Response, message?: string, error?: string): Response<ApiResponse>;
    static internalServerError(res: Response, message?: string, error?: string): Response<ApiResponse>;
}
export default ResponseUtil;
//# sourceMappingURL=response.d.ts.map