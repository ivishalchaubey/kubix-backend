import { Response } from "express";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
} from "../types/global.js";
import { HttpStatus } from "../constants/enums.js";

class ResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message = "Success",
    statusCode = HttpStatus.OK
  ): Response<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message = "Something went wrong",
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
    error?: string
  ): Response<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      message,
      statusCode,
      ...(error && { error }),
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    meta: PaginationMeta,
    message = "Success",
    statusCode = HttpStatus.OK
  ): Response<PaginatedResponse<T>> {
    const response: PaginatedResponse<T> = {
      success: true,
      message,
      data,
      meta,
      statusCode,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message = "Resource created successfully"
  ): Response<ApiResponse<T>> {
    return this.success(res, data, message, HttpStatus.CREATED);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  /**
   * Send bad request response
   */
  static badRequest(
    res: Response,
    message = "Bad request",
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, HttpStatus.BAD_REQUEST, error);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message = "Unauthorized",
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, HttpStatus.UNAUTHORIZED, error);
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message = "Forbidden",
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, HttpStatus.FORBIDDEN, error);
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message = "Resource not found",
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, HttpStatus.NOT_FOUND, error);
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message = "Conflict",
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, HttpStatus.CONFLICT, error);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    message = "Validation failed",
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, HttpStatus.UNPROCESSABLE_ENTITY, error);
  }

  /**
   * Send internal server error response
   */
  static internalServerError(
    res: Response,
    message = "Internal server error",
    error?: string
  ): Response<ApiResponse> {
    return this.error(res, message, HttpStatus.INTERNAL_SERVER_ERROR, error);
  }
}

export default ResponseUtil;
