/**
 * Health Check Middleware
 * Provides detailed health status for monitoring
 */

const mongoose = require('mongoose');
const { createLogger } = require('../lib/logger');

const logger = createLogger('health-check');

/**
 * Basic health check
 * Returns 200 if app is running
 */
function liveness(req, res) {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'lesociety-api'
    });
}

/**
 * Readiness check
 * Returns 200 only if all dependencies are ready
 */
async function readiness(req, res) {
    const checks = {
        database: 'unknown',
        memory: 'unknown',
        uptime: process.uptime()
    };

    let isReady = true;

    // Check database connection
    try {
        if (mongoose.connection.readyState === 1) {
            checks.database = 'connected';
        } else {
            checks.database = 'disconnected';
            isReady = false;
        }
    } catch (error) {
        checks.database = 'error';
        isReady = false;
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024)
    };

    // Check if memory usage is acceptable (< 80% of heap)
    const heapUsagePercent = (memoryUsageMB.heapUsed / memoryUsageMB.heapTotal) * 100;
    
    if (heapUsagePercent > 80) {
        checks.memory = `warning: ${heapUsagePercent.toFixed(1)}% used`;
        logger.warn('High memory usage detected', memoryUsageMB);
    } else {
        checks.memory = `ok: ${heapUsagePercent.toFixed(1)}% used`;
    }

    checks.memoryDetails = memoryUsageMB;

    const statusCode = isReady ? 200 : 503;
    
    res.status(statusCode).json({
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks
    });
}

/**
 * Detailed health check
 * Provides comprehensive system information
 */
async function detailed(req, res) {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || 'unknown',
        uptime: {
            process: process.uptime(),
            system: require('os').uptime()
        },
        database: {
            status: 'unknown',
            readyState: mongoose.connection.readyState,
            name: mongoose.connection.name
        },
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: {
            node: process.version,
            platform: process.platform,
            arch: process.arch
        }
    };

    // Database status
    try {
        if (mongoose.connection.readyState === 1) {
            health.database.status = 'connected';
            
            // Get database stats
            const db = mongoose.connection.db;
            const stats = await db.stats();
            
            health.database.collections = stats.collections;
            health.database.dataSize = stats.dataSize;
            health.database.storageSize = stats.storageSize;
        } else {
            health.database.status = 'disconnected';
            health.status = 'degraded';
        }
    } catch (error) {
        health.database.status = 'error';
        health.database.error = error.message;
        health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
}

module.exports = {
    liveness,
    readiness,
    detailed
};
