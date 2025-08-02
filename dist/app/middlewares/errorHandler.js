import { HttpStatus, API_MESSAGES } from "../constants/enums.js";
import ResponseUtil from "../utils/response.js";
import logger from "../utils/logger.js";
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, HttpStatus.BAD_REQUEST);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, HttpStatus.CONFLICT);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new AppError(message, HttpStatus.BAD_REQUEST);
};
const handleJWTError = () => new AppError("Invalid token. Please log in again!", HttpStatus.UNAUTHORIZED);
const handleJWTExpiredError = () => new AppError("Your token has expired! Please log in again.", HttpStatus.UNAUTHORIZED);
const sendErrorDev = (err, res) => {
    logger.error("Error details:", {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
    });
    ResponseUtil.error(res, err.message, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err.stack);
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        logger.error("Operational error:", err.message);
        ResponseUtil.error(res, err.message, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    else {
        logger.error("Programming error:", {
            message: err.message,
            stack: err.stack,
        });
        ResponseUtil.internalServerError(res, API_MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
    }
};
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    }
    else {
        let error = { ...err };
        error.message = err.message;
        if (error.name === "CastError")
            error = handleCastErrorDB(error);
        if (error.code === 11000)
            error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError")
            error = handleJWTError();
        if (error.name === "TokenExpiredError")
            error = handleJWTExpiredError();
        sendErrorProd(error, res);
    }
};
export { AppError };
export default globalErrorHandler;
//# sourceMappingURL=errorHandler.js.map