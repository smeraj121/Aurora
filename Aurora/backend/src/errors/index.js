// src/errors/index.js

/**
 * Base custom error class.
 * Extend this for specific error types.
 */
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.statusCode = 401;
    this.name = 'UnauthorizedError';
  }
}

class ConflictError extends CustomError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ValidationError extends CustomError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

// Export all errors
module.exports = {
  CustomError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ValidationError,
};