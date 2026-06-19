/**
 * Redis-backed Rate Limiter
 * Production-ready rate limiting that works across multiple server instances
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Initialize Redis client if REDIS_URL is configured
let redisClient = null;
let redisStore = null;

if (process.env.REDIS_URL) {
    try {
        redisClient = new Redis(process.env.REDIS_URL, {
            enableOfflineQueue: false,
            maxRetriesPerRequest: 3,
        });

        redisClient.on('error', (err) => {
            console.error('Redis rate limiter error:', err);
        });

        redisClient.on('connect', () => {
            console.log('Redis rate limiter connected');
        });

        redisStore = new RedisStore({
            client: redisClient,
            prefix: 'rl:',
        });
    } catch (err) {
        console.error('Failed to initialize Redis rate limiter:', err);
    }
}

/**
 * Create rate limiter with optional Redis backing
 */
function createRateLimiter(options = {}) {
    const defaultOptions = {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        message: {
            status: 429,
            message: 'Too many requests, please try again later.',
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            // Skip rate limiting for health checks
            return req.path === '/health' || req.path === '/ready' || req.path === '/alive';
        },
    };

    const config = { ...defaultOptions, ...options };

    // Use Redis store if available, otherwise fall back to memory
    if (redisStore && process.env.NODE_ENV === 'production') {
        config.store = redisStore;
    } else if (process.env.NODE_ENV === 'production' && !redisStore) {
        console.warn('WARNING: Using in-memory rate limiting in production. Configure REDIS_URL for proper rate limiting.');
    }

    return rateLimit(config);
}

// Specific rate limiters for different endpoints
const rateLimiters = {
    // Strict rate limiting for authentication endpoints
    auth: createRateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 attempts per 15 minutes
        message: {
            status: 429,
            message: 'Too many login attempts, please try again later.',
        },
    }),

    // API endpoints
    api: createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 100,
    }),

    // File uploads - stricter
    upload: createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // 20 uploads per hour
        message: {
            status: 429,
            message: 'Too many file uploads, please try again later.',
        },
    }),

    // Chat/messaging - more permissive
    chat: createRateLimiter({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 30, // 30 messages per minute
    }),

    // Date creation - moderate
    createDate: createRateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // 10 dates per hour
        message: {
            status: 429,
            message: 'Date creation limit reached, please try again later.',
        },
    }),

    // Payment endpoints - strict
    payment: createRateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 5, // 5 payment attempts per 15 minutes
        message: {
            status: 429,
            message: 'Too many payment attempts, please try again later.',
        },
    }),
};

module.exports = {
    createRateLimiter,
    rateLimiters,
    redisClient,
};
