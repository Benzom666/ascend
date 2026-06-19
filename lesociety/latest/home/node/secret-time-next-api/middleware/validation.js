/**
 * Input Validation Middleware
 * Sanitizes and validates incoming requests
 * Protects against injection attacks and malformed data
 */

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize key
    const sanitizedKey = sanitizeString(key);
    
    // Sanitize value based on type
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeString(value);
    } else if (typeof value === 'object') {
      sanitized[sanitizedKey] = sanitizeObject(value);
    } else {
      sanitized[sanitizedKey] = value;
    }
  }
  return sanitized;
};

/**
 * Sanitize request body and query params
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validation rules for common fields
 */
const validators = {
  email: (value) => ({
    valid: isValidEmail(value),
    message: 'Invalid email format'
  }),
  
  objectId: (value) => ({
    valid: isValidObjectId(value),
    message: 'Invalid ID format'
  }),
  
  string: (value, options = {}) => {
    const { minLength = 1, maxLength = 1000, required = true } = options;
    
    if (!value && !required) return { valid: true };
    
    if (typeof value !== 'string') {
      return { valid: false, message: 'Must be a string' };
    }
    
    if (value.length < minLength) {
      return { valid: false, message: `Minimum length is ${minLength}` };
    }
    
    if (value.length > maxLength) {
      return { valid: false, message: `Maximum length is ${maxLength}` };
    }
    
    return { valid: true };
  },
  
  number: (value, options = {}) => {
    const { min, max, required = true } = options;
    
    if ((value === undefined || value === null) && !required) {
      return { valid: true };
    }
    
    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, message: 'Must be a number' };
    }
    
    if (min !== undefined && num < min) {
      return { valid: false, message: `Minimum value is ${min}` };
    }
    
    if (max !== undefined && num > max) {
      return { valid: false, message: `Maximum value is ${max}` };
    }
    
    return { valid: true };
  }
};

/**
 * Validate request body against schema
 * @param {Object} schema - Validation schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }
      
      // Skip validation if not required and value is empty
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }
      
      // Apply validator
      if (rules.type && validators[rules.type]) {
        const result = validators[rules.type](value, rules);
        if (!result.valid) {
          errors.push({ field, message: result.message });
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        status: 400,
        message: 'Validation failed',
        errors
      });
    }
    
    next();
  };
};

/**
 * Validate request params
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [param, rules] of Object.entries(schema)) {
      const value = req.params[param];
      
      if (rules.required && !value) {
        errors.push({ param, message: `${param} is required` });
        continue;
      }
      
      if (rules.type === 'objectId' && value) {
        if (!isValidObjectId(value)) {
          errors.push({ param, message: `Invalid ${param} format` });
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid parameters',
        errors
      });
    }
    
    next();
  };
};

/**
 * Request size limiter
 * Prevents large payload attacks
 */
const limitRequestSize = (maxSize = 10 * 1024 * 1024) => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || 0);
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        status: 413,
        message: `Request entity too large. Max size: ${maxSize} bytes`
      });
    }
    
    next();
  };
};

module.exports = {
  sanitizeInput,
  validateBody,
  validateParams,
  limitRequestSize,
  validators,
  isValidEmail,
  isValidObjectId
};
