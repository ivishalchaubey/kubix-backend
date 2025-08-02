import { HttpStatus } from "../constants/enums.js";
class ResponseUtil {
    static success(res, data, message = "Success", statusCode = HttpStatus.OK) {
        const response = {
            success: true,
            message,
            data,
            statusCode,
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message = "Something went wrong", statusCode = HttpStatus.INTERNAL_SERVER_ERROR, error) {
        const response = {
            success: false,
            message,
            statusCode,
            ...(error && { error }),
        };
        return res.status(statusCode).json(response);
    }
    static paginated(res, data, meta, message = "Success", statusCode = HttpStatus.OK) {
        const response = {
            success: true,
            message,
            data,
            meta,
            statusCode,
        };
        return res.status(statusCode).json(response);
    }
    static created(res, data, message = "Resource created successfully") {
        return this.success(res, data, message, HttpStatus.CREATED);
    }
    static noContent(res) {
        return res.status(HttpStatus.NO_CONTENT).send();
    }
    static badRequest(res, message = "Bad request", error) {
        return this.error(res, message, HttpStatus.BAD_REQUEST, error);
    }
    static unauthorized(res, message = "Unauthorized", error) {
        return this.error(res, message, HttpStatus.UNAUTHORIZED, error);
    }
    static forbidden(res, message = "Forbidden", error) {
        return this.error(res, message, HttpStatus.FORBIDDEN, error);
    }
    static notFound(res, message = "Resource not found", error) {
        return this.error(res, message, HttpStatus.NOT_FOUND, error);
    }
    static conflict(res, message = "Conflict", error) {
        return this.error(res, message, HttpStatus.CONFLICT, error);
    }
    static validationError(res, message = "Validation failed", error) {
        return this.error(res, message, HttpStatus.UNPROCESSABLE_ENTITY, error);
    }
    static internalServerError(res, message = "Internal server error", error) {
        return this.error(res, message, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
}
export default ResponseUtil;
//# sourceMappingURL=response.js.map