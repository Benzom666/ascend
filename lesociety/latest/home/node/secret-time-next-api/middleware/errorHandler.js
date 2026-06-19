/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses and logging
 */

const { createLogger } = require('../lib/logger');
const logger = createLogger('error-handler');

/**
 * Custom Application Errors
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = {}) {
        super(message, 422);
        this.errors = errors;
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}

class RateLimitError extends AppError {
    constructor(retryAfter = 60) {
        super('Too many requests', 429);
        this.retryAfter = retryAfter;
    }
}

/**
 * Error response formatter
 */
function formatErrorResponse(error, req) {
    const statusCode = error.statusCode || 500;
    const isProduction = process.env.NODE_ENV === 'production';

    const response = {
        status: statusCode,
        error: true,
        message: error.message || 'Internal server error',
        ...(error.errors && { errors: error.errors }),
        ...(error.retryAfter && { retryAfter: error.retryAfter })
    };

    // Don't expose stack traces in production
    if (!isProduction) {
        response.stack = error.stack;
        response.path = req.path;
        response.method = req.method;
    }

    // Generic message for 500 errors in production
    if (isProduction && statusCode === 500) {
        response.message = 'An unexpected error occurred';
    }

    return response;
}

/**
 * Main error handling middleware
 */
function errorHandler(err, req, res, next) {
    // Set defaults
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log the error
    const logContext = {
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?._id || req.datajwt?.userId,
        ...(err.errors && { validationErrors: err.errors })
    };

    if (err.statusCode >= 500) {
        logger.error(err.message, err, logContext);
    } else if (err.statusCode >= 400) {
        logger.warn(err.message, logContext);
    }

    // Send to Sentry if configured (for 500 errors)
    if (process.env.SENTRY_DSN && err.statusCode >= 500) {
        try {
            const Sentry = require('@sentry/node');
            Sentry.captureException(err, {
                user: req.user ? { id: req.user._id, email: req.user.email } : undefined,
                tags: {
                    path: req.path,
                    method: req.method
                }
            });
        } catch (sentryError) {
            logger.error('Failed to send error to Sentry', sentryError);
        }
    }

    // Send response
    const response = formatErrorResponse(err, req);
    res.status(err.statusCode).json(response);
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * 404 handler
 */
function notFoundHandler(req, res, next) {
    const error = new NotFoundError('Route');
    error.message = `Cannot ${req.method} ${req.originalUrl}`;
    next(error);
}

/**
 * Validation error handler
 * Converts express-validator errors to AppError
 */
function handleValidationErrors(errors) {
    const formattedErrors = {};
    errors.array().forEach(error => {
        formattedErrors[error.param] = error.msg;
    });
    return new ValidationError('Validation failed', formattedErrors);
}

module.exports = {
    // Error classes
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    
    // Middleware
    errorHandler,
    notFoundHandler,
    asyncHandler,
    
    // Utilities
    handleValidationErrors
};
