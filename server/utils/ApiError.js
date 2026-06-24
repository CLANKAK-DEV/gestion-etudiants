// Operational error carrying an HTTP status code; the error middleware turns
// it into a clean JSON response. Use the static helpers to construct one.
export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details) {
    return new ApiError(400, message, details);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(409, message);
  }

  static unprocessable(message = "Validation failed", details) {
    return new ApiError(422, message, details);
  }

  static internal(message = "Something went wrong") {
    return new ApiError(500, message);
  }
}
