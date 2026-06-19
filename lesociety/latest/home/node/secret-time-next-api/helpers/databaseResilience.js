/**
 * Database Resilience Helper
 * Adds retry logic and connection monitoring for MongoDB
 */

const mongoose = require('mongoose');

/**
 * Connection retry configuration
 */
const RETRY_CONFIG = {
    maxRetries: 5,
    retryDelay: 5000, // 5 seconds
    backoffMultiplier: 2, // Exponential backoff
    maxRetryDelay: 60000, // 1 minute max
};

/**
 * Connect to MongoDB with retry logic
 */
async function connectWithRetry(uri, options = {}, retryCount = 0) {
    try {
        console.log(`Attempting MongoDB connection (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})...`);
        
        await mongoose.connect(uri, {
            ...options,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✓ MongoDB connected successfully');
        return true;
        
    } catch (error) {
        console.error(`MongoDB connection failed (attempt ${retryCount + 1}):`, error.message);
        
        if (retryCount >= RETRY_CONFIG.maxRetries - 1) {
            console.error('✗ Max retry attempts reached. Exiting...');
            throw new Error(`Failed to connect to MongoDB after ${RETRY_CONFIG.maxRetries} attempts`);
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
            RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
            RETRY_CONFIG.maxRetryDelay
        );
        
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
        
        return connectWithRetry(uri, options, retryCount + 1);
    }
}

/**
 * Monitor connection health
 */
function monitorConnection() {
    const db = mongoose.connection;
    
    db.on('connected', () => {
        console.log('MongoDB: Connected');
    });
    
    db.on('error', (err) => {
        console.error('MongoDB: Connection error:', err);
        
        // Send to monitoring service if configured
        if (process.env.SENTRY_DSN) {
            const Sentry = require('@sentry/node');
            Sentry.captureException(err, {
                tags: { component: 'database' },
            });
        }
    });
    
    db.on('disconnected', () => {
        console.warn('MongoDB: Disconnected');
        
        // Attempt to reconnect
        if (process.env.NODE_ENV === 'production') {
            console.log('Attempting to reconnect...');
            mongoose.connect(mongoose.connection._connectionString);
        }
    });
    
    db.on('reconnected', () => {
        console.log('MongoDB: Reconnected');
    });
    
    db.on('close', () => {
        console.log('MongoDB: Connection closed');
    });
}

/**
 * Check if database is connected
 */
function isConnected() {
    return mongoose.connection.readyState === 1;
}

/**
 * Wait for database to be ready
 */
async function waitForConnection(timeout = 30000) {
    const start = Date.now();
    
    while (!isConnected()) {
        if (Date.now() - start > timeout) {
            throw new Error('Database connection timeout');
        }
        await sleep(100);
    }
    
    return true;
}

/**
 * Gracefully close database connection
 */
async function closeConnection() {
    try {
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed gracefully');
        return true;
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        return false;
    }
}

/**
 * Execute query with retry on failure
 */
async function queryWithRetry(queryFn, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await queryFn();
        } catch (error) {
            console.error(`Query failed (attempt ${i + 1}/${retries}):`, error.message);
            
            // Don't retry on validation errors
            if (error.name === 'ValidationError') {
                throw error;
            }
            
            if (i === retries - 1) {
                throw error;
            }
            
            // Wait before retry
            await sleep(1000 * (i + 1));
        }
    }
}

/**
 * Check database health
 */
async function healthCheck() {
    try {
        if (!isConnected()) {
            return { healthy: false, reason: 'Not connected' };
        }
        
        // Ping database
        await mongoose.connection.db.admin().ping();
        
        return {
            healthy: true,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        };
    } catch (error) {
        return {
            healthy: false,
            reason: error.message,
        };
    }
}

/**
 * Get connection statistics
 */
function getConnectionStats() {
    const connection = mongoose.connection;
    
    return {
        readyState: connection.readyState,
        readyStateString: getReadyStateString(connection.readyState),
        host: connection.host,
        name: connection.name,
        models: Object.keys(connection.models),
        collections: Object.keys(connection.collections),
    };
}

/**
 * Convert ready state number to string
 */
function getReadyStateString(state) {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };
    return states[state] || 'unknown';
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    connectWithRetry,
    monitorConnection,
    isConnected,
    waitForConnection,
    closeConnection,
    queryWithRetry,
    healthCheck,
    getConnectionStats,
};
