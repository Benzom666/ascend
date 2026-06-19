/**
 * Centralized Logging Service
 * Replaces console.log with structured, environment-aware logging
 */

const winston = require('winston');
const winstonLog = require('../config/winston');

/**
 * Log levels (RFC 5424 syslog severity)
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */

/**
 * Logger wrapper with consistent interface
 */
class Logger {
    constructor(context = 'app') {
        this.context = context;
    }

    /**
     * Log debug information (development only)
     */
    debug(message, meta = {}) {
        if (process.env.NODE_ENV !== 'production') {
            winstonLog.debug(`[${this.context}] ${message}`, meta);
        }
    }

    /**
     * Log general information
     */
    info(message, meta = {}) {
        winstonLog.info(`[${this.context}] ${message}`, meta);
    }

    /**
     * Log warnings
     */
    warn(message, meta = {}) {
        winstonLog.warn(`[${this.context}] ${message}`, meta);
    }

    /**
     * Log errors
     */
    error(message, error = null, meta = {}) {
        const errorMeta = {
            ...meta,
            ...(error && {
                error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                }
            })
        };
        winstonLog.error(`[${this.context}] ${message}`, errorMeta);
    }

    /**
     * Log HTTP requests
     */
    http(message, meta = {}) {
        winstonLog.http(`[${this.context}] ${message}`, meta);
    }

    /**
     * Create child logger with nested context
     */
    child(subContext) {
        return new Logger(`${this.context}:${subContext}`);
    }
}

/**
 * Create logger for specific context
 * @param {string} context - Logger context (e.g., 'auth', 'user', 'payment')
 * @returns {Logger}
 */
function createLogger(context) {
    return new Logger(context);
}

/**
 * Default logger instance
 */
const logger = new Logger('app');

/**
 * Legacy console.log replacement
 * USE SPARINGLY - Prefer context-specific loggers
 */
const log = {
    debug: (...args) => {
        if (process.env.NODE_ENV !== 'production') {
            logger.debug(args.join(' '));
        }
    },
    info: (...args) => logger.info(args.join(' ')),
    warn: (...args) => logger.warn(args.join(' ')),
    error: (...args) => {
        const message = args.filter(a => typeof a === 'string').join(' ');
        const error = args.find(a => a instanceof Error);
        logger.error(message, error);
    }
};

module.exports = {
    Logger,
    createLogger,
    logger,
    log
};
