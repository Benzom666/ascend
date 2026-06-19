/**
 * Request Tracking Middleware
 * Adds unique request IDs and performance tracking
 */

const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

/**
 * Add unique request ID to every request
 * Useful for tracing requests across logs
 */
function addRequestId(req, res, next) {
    req.id = req.headers['x-request-id'] || uuidv4();
    res.setHeader('X-Request-ID', req.id);
    next();
}

/**
 * Log request details
 */
function logRequest(req, res, next) {
    const start = Date.now();
    
    // Log request start
    console.log(`[${req.id}] ${req.method} ${req.path} - Started`);
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to log when response completes
    res.end = function(...args) {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
        
        console.log(`[${req.id}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
        
        // Log slow requests
        if (duration > 1000) {
            console.warn(`[${req.id}] SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
        }
        
        // Call original end
        originalEnd.apply(res, args);
    };
    
    next();
}

/**
 * Performance monitoring middleware
 * Tracks response times and logs slow endpoints
 */
function performanceMonitoring(req, res, next) {
    const start = process.hrtime();
    
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to ms
        
        // Add performance header
        res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
        
        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            const logData = {
                requestId: req.id,
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                duration: `${duration.toFixed(2)}ms`,
                userAgent: req.headers['user-agent'],
            };
            
            if (duration > 2000) {
                console.warn('VERY SLOW REQUEST:', logData);
            } else if (duration > 1000) {
                console.warn('SLOW REQUEST:', logData);
            }
        }
        
        // Send to monitoring service if configured
        if (process.env.SENTRY_DSN && duration > 3000) {
            const Sentry = require('@sentry/node');
            Sentry.captureMessage(`Slow API endpoint: ${req.method} ${req.path}`, {
                level: 'warning',
                extra: {
                    duration: `${duration.toFixed(2)}ms`,
                    path: req.path,
                    method: req.method,
                },
            });
        }
    });
    
    next();
}

/**
 * Track active requests
 * Useful for graceful shutdown
 */
let activeRequests = 0;

function trackActiveRequests(req, res, next) {
    activeRequests++;
    
    res.on('finish', () => {
        activeRequests--;
    });
    
    next();
}

/**
 * Get current active request count
 */
function getActiveRequestCount() {
    return activeRequests;
}

/**
 * Wait for all active requests to complete
 * Used during graceful shutdown
 */
function waitForActiveRequests(timeout = 30000) {
    return new Promise((resolve, reject) => {
        const checkInterval = 100;
        let elapsed = 0;
        
        const interval = setInterval(() => {
            if (activeRequests === 0) {
                clearInterval(interval);
                resolve();
            } else if (elapsed >= timeout) {
                clearInterval(interval);
                reject(new Error(`Timeout waiting for ${activeRequests} active requests to complete`));
            }
            elapsed += checkInterval;
        }, checkInterval);
    });
}

/**
 * User activity tracking
 * Track user sessions and activity
 */
function trackUserActivity(req, res, next) {
    if (req.user && req.user.id) {
        // Could store in Redis with expiry for "active users" tracking
        req.user.lastActivity = new Date();
    }
    next();
}

module.exports = {
    addRequestId,
    logRequest,
    performanceMonitoring,
    trackActiveRequests,
    getActiveRequestCount,
    waitForActiveRequests,
    trackUserActivity,
};
