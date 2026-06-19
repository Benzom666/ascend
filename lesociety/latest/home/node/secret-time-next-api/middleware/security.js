/**
 * Security Middleware
 * Comprehensive security setup for production
 */

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

/**
 * Configure Helmet security headers
 */
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:", "wss:"],
            fontSrc: ["'self'", "data:", "https:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow external resources
    crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * MongoDB query sanitization
 * Prevents NoSQL injection attacks
 */
const sanitizeMiddleware = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`Sanitized potentially malicious input: ${key}`);
    },
});

/**
 * Response compression
 * Reduces bandwidth and improves performance
 */
const compressionMiddleware = compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6, // Balance between speed and compression ratio
});

/**
 * Request timeout middleware
 * Prevents hanging requests from consuming resources
 */
const timeoutMiddleware = (req, res, next) => {
    const timeout = parseInt(process.env.REQUEST_TIMEOUT_MS) || 30000; // 30 seconds default
    
    req.setTimeout(timeout, () => {
        res.status(408).json({
            status: 408,
            message: 'Request timeout',
        });
    });
    
    res.setTimeout(timeout, () => {
        res.status(504).json({
            status: 504,
            message: 'Response timeout',
        });
    });
    
    next();
};

/**
 * Additional security headers
 */
const additionalSecurityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // HSTS (HTTPS only - production)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    next();
};

/**
 * Body size limits
 * Prevent large payload DoS attacks
 */
const bodySizeLimits = {
    json: { limit: '10mb' },
    urlencoded: { extended: false, limit: '10mb' },
};

module.exports = {
    helmetConfig,
    sanitizeMiddleware,
    compressionMiddleware,
    timeoutMiddleware,
    additionalSecurityHeaders,
    bodySizeLimits,
};
