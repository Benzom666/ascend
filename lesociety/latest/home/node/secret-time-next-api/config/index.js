/**
 * Centralized Configuration Module
 * Single source of truth for all app configuration
 */

const path = require('path');

/**
 * Load environment variables
 */
require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

/**
 * Configuration object
 */
const config = {
    // ============================================
    // Environment
    // ============================================
    env: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',

    // ============================================
    // Server
    // ============================================
    server: {
        port: parseInt(process.env.PORT, 10) || 3001,
        host: process.env.HOST || '0.0.0.0',
        appUrl: process.env.APP_URL || `http://localhost:${process.env.PORT || 3001}`
    },

    // ============================================
    // Database
    // ============================================
    database: {
        user: process.env.MONGO_USER,
        password: process.env.MONGO_PASS,
        host: process.env.MONGO_HOST,
        name: process.env.DB_NAME || 'lesociety',
        uri: process.env.MONGO_URI,
        options: {
            maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 100,
            minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 10,
            serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_TIMEOUT, 10) || 30000,
            socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT, 10) || 45000
        }
    },

    // ============================================
    // Authentication
    // ============================================
    auth: {
        jwtSecret: process.env.JWT_SECRET_TOKEN || process.env.JWT_SECRET,
        jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
        jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10
    },

    // ============================================
    // CORS
    // ============================================
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
            : [],
        credentials: true,
        maxAge: 86400 // 24 hours
    },

    // ============================================
    // Rate Limiting
    // ============================================
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
    },

    // ============================================
    // File Storage - Supabase
    // ============================================
    storage: {
        supabase: {
            url: process.env.SUPABASE_URL,
            serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            bucket: process.env.SUPABASE_STORAGE_BUCKET || 'secret-time-uploads'
        }
    },

    // ============================================
    // Email
    // ============================================
    email: {
        sendgrid: {
            apiKey: process.env.SENDGRID_API_KEY
        },
        smtp: {
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.MAIL_PORT, 10) || 587,
            user: process.env.MAIL_USER,
            password: process.env.MAIL_PASS,
            from: process.env.MAIL_FROM || 'noreply@lesociety.com'
        }
    },

    // ============================================
    // Payment - ELPay
    // ============================================
    payment: {
        elpay: {
            apiKey: process.env.ELPAY_API_KEY,
            apiSecret: process.env.ELPAY_API_SECRET,
            webhookSecret: process.env.ELPAY_WEBHOOK_SECRET
        }
    },

    // ============================================
    // External Services
    // ============================================
    services: {
        sentry: {
            dsn: process.env.SENTRY_DSN,
            environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
            tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1
        },
        redis: {
            url: process.env.REDIS_URL,
            password: process.env.REDIS_PASSWORD,
            tls: process.env.REDIS_TLS === 'true'
        }
    },

    // ============================================
    // Logging
    // ============================================
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        enableConsole: process.env.ENABLE_CONSOLE_LOG !== 'false'
    },

    // ============================================
    // Cron Jobs
    // ============================================
    cron: {
        enabled: process.env.ENABLE_CRON !== 'false',
        interval: process.env.CRON_INTERVAL || '*/1 * * * *' // Every 1 minute
    },

    // ============================================
    // Business Logic
    // ============================================
    business: {
        chatRequestExpiryHours: parseInt(process.env.CHAT_REQUEST_EXPIRY_HOURS, 10) || 48,
        maxPhotosPerUser: parseInt(process.env.MAX_PHOTOS_PER_USER, 10) || 6,
        minProfileAge: parseInt(process.env.MIN_PROFILE_AGE, 10) || 18,
        maxProfileAge: parseInt(process.env.MAX_PROFILE_AGE, 10) || 120
    },

    // ============================================
    // Feature Flags
    // ============================================
    features: {
        enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION !== 'false',
        enablePhotoVerification: process.env.ENABLE_PHOTO_VERIFICATION !== 'false',
        enablePayments: process.env.ENABLE_PAYMENTS !== 'false',
        enableChat: process.env.ENABLE_CHAT !== 'false'
    }
};

/**
 * Validate required configuration
 */
function validateConfig() {
    const required = [
        'database.user',
        'database.password',
        'database.host',
        'auth.jwtSecret'
    ];

    const missing = [];

    required.forEach(key => {
        const keys = key.split('.');
        let value = config;
        
        for (const k of keys) {
            value = value?.[k];
        }

        if (!value) {
            missing.push(key);
        }
    });

    if (missing.length > 0) {
        throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
}

/**
 * Get database connection URI
 */
function getDatabaseURI() {
    if (config.database.uri) {
        return config.database.uri;
    }

    const { user, password, host, name } = config.database;
    return `mongodb+srv://${user}:${encodeURIComponent(password)}@${host}/${name}?retryWrites=true&w=majority`;
}

// Validate on load (only in non-test environments)
if (config.env !== 'test') {
    validateConfig();
}

module.exports = {
    ...config,
    getDatabaseURI,
    validateConfig
};
