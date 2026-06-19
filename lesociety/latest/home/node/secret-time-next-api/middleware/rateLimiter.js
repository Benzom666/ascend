/**
 * Rate Limiting Middleware for LeSociety API
 * Protects against abuse and ensures fair usage
 */

const rateLimitStore = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitStore.entries()) {
        if (now - data.resetTime > 60000) {
            rateLimitStore.delete(key);
        }
    }
}, 300000);

/**
 * Simple in-memory rate limiter
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.maxRequests - Max requests per window (default: 100)
 * @param {string} options.keyPrefix - Prefix for the key (default: '')
 */
const rateLimit = (options = {}) => {
    const {
        windowMs = 60000,
        maxRequests = 100,
        keyPrefix = '',
        skipSuccessfulRequests = false
    } = options;

    return (req, res, next) => {
        // Get client identifier (IP or user ID if authenticated)
        const clientId = req.datajwt?.userdata?._id || 
                        req.headers['x-forwarded-for'] || 
                        req.connection.remoteAddress || 
                        'unknown';
        
        const key = `${keyPrefix}:${clientId}`;
        const now = Date.now();

        // Get or create rate limit data
        let limitData = rateLimitStore.get(key);
        
        if (!limitData || now > limitData.resetTime) {
            limitData = {
                count: 0,
                resetTime: now + windowMs
            };
        }

        // Check if limit exceeded
        if (limitData.count >= maxRequests) {
            const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            return res.status(429).json({
                status: 429,
                message: 'Too many requests, please try again later.',
                retryAfter: retryAfter
            });
        }

        // Increment counter
        limitData.count++;
        rateLimitStore.set(key, limitData);

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - limitData.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(limitData.resetTime / 1000));

        // Track successful requests for decrement if needed
        if (skipSuccessfulRequests) {
            const originalJson = res.json;
            res.json = function(body) {
                if (res.statusCode >= 200 && res.statusCode < 300 && limitData.count > 0) {
                    limitData.count--;
                    rateLimitStore.set(key, limitData);
                }
                return originalJson.call(this, body);
            };
        }

        next();
    };
};

// ============================================
// SECURITY FIX: Enhanced Rate Limit Configurations
// ============================================
const rateLimits = {
    // CRITICAL: Authentication endpoints (prevent brute force)
    auth: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: process.env.NODE_ENV === 'production' ? 5 : 20, // Stricter in production
        keyPrefix: 'auth'
    }),

    // Login specifically (even stricter)
    login: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: process.env.NODE_ENV === 'production' ? 3 : 10,
        keyPrefix: 'login'
    }),

    // Password reset (prevent enumeration)
    passwordReset: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
        keyPrefix: 'password-reset'
    }),

    // Standard API limits
    api: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: process.env.NODE_ENV === 'production' ? 60 : 100,
        keyPrefix: 'api'
    }),

    // Chat/message limits (prevent spam)
    chat: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: process.env.NODE_ENV === 'production' ? 20 : 30,
        keyPrefix: 'chat'
    }),

    // Date creation POST (prevent abuse)
    dateCreate: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: process.env.NODE_ENV === 'production' ? 10 : 20,
        keyPrefix: 'date-create'
    }),

    // Date viewing/listing (generous)
    date: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
        keyPrefix: 'date'
    }),

    // File uploads (prevent resource exhaustion)
    fileUpload: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: process.env.NODE_ENV === 'production' ? 20 : 50,
        keyPrefix: 'file-upload'
    }),

    // Payment endpoints (critical)
    payment: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 30,
        keyPrefix: 'payment'
    }),

    // Admin endpoints
    admin: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
        keyPrefix: 'admin'
    }),

    // Generic strict limit
    strict: rateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10,
        keyPrefix: 'strict'
    })
};

module.exports = {
    rateLimit,
    rateLimits
};
