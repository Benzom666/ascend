/**
 * Enhanced Input Validation Middleware
 * SECURITY: Prevents injection attacks, XSS, and malformed data
 */

const { body, query, param, validationResult } = require('express-validator');
const helper = require('../helpers/helper');

/**
 * Common validation chains
 */
const commonValidators = {
    email: () => 
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Invalid email format')
            .normalizeEmail()
            .isLength({ max: 255 }).withMessage('Email too long'),
    
    password: () =>
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
            .isLength({ max: 128 }).withMessage('Password too long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain uppercase, lowercase, and number'),
    
    weakPassword: () =>
        body('password')
            .notEmpty().withMessage('Password is required')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
            .isLength({ max: 128 }).withMessage('Password too long'),
    
    mongoId: (field = 'id') =>
        param(field)
            .trim()
            .notEmpty().withMessage(`${field} is required`)
            .isMongoId().withMessage(`Invalid ${field} format`),
};

/**
 * Sanitize input - remove potentially dangerous content
 */
const sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        str = str.replace(/\0/g, ''); // Remove null bytes
        str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        return str;
    };

    const sanitizeObject = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'string') {
                obj[key] = sanitizeString(obj[key]);
            } else if (typeof obj[key] === 'object') {
                obj[key] = sanitizeObject(obj[key]);
            }
        });
        return obj;
    };

    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    
    next();
};

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = {};
        errors.array().forEach(error => {
            formattedErrors[error.param] = error.msg;
        });
        return res.status(422).json(
            helper.errorResponse(formattedErrors, 422, 'Validation failed')
        );
    }
    next();
};

module.exports = {
    commonValidators,
    sanitizeInput,
    handleValidationErrors,
};
