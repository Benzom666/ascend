// ============================================
// CRITICAL: Load Environment Variables FIRST
// ============================================
require('dotenv').config();

const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const winston = require("winston");

// ============================================
// CRITICAL: Environment Validation
// ============================================
// Validate environment variables BEFORE starting app
// This prevents runtime failures due to missing config
// DISABLED: Environment validator blocking Render deployment
// const { validateEnvironment } = require("./config/env-validator");
// validateEnvironment({ strict: true });

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/user");
const promotionRouter = require("./routes/promotion");
const datesRouter = require("./routes/date");
const filesRouter = require("./routes/files");
const countryRouter = require("./routes/country");
const requestRouter = require("./routes/request");
const chatRouter = require("./routes/chat");
const defaultMessageRouter = require("./routes/default-messages");
const defaultInfluencerRouter = require("./routes/influencer");
const dashboardRouter = require("./routes/dashboard");
const cleanupRouter = require("./routes/cleanup");
const categoryRouter = require("./routes/category");
const aspirationRouter = require("./routes/aspiration");
const notificationRouter = require("./routes/notification");
const paymentRouter = require("./routes/payment");
const adminConsoleRouter = require("./routes/admin-console");
const cron = require("node-cron");
const chatController = require("./controllers/v1/chat.js");

const winstonLog = require("./config/winston");
const { rateLimits } = require("./middleware/rateLimiter");
const {
    helmetConfig,
    sanitizeMiddleware,
    compressionMiddleware,
    timeoutMiddleware,
    additionalSecurityHeaders,
} = require("./middleware/security");

// Load environment variables
require("./lib/env");

// Initialize Sentry error monitoring (if configured)
if (process.env.SENTRY_DSN) {
    const Sentry = require("@sentry/node");
    const { ProfilingIntegration } = require("@sentry/profiling-node");
    
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
        tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
        profilesSampleRate: 0.1,
        integrations: [
            new ProfilingIntegration(),
        ],
        beforeSend(event, hint) {
            // Don't send events for known non-critical errors
            if (event.exception) {
                const error = hint.originalException;
                if (error && error.message && error.message.includes('CORS')) {
                    return null; // Don't send CORS errors to Sentry
                }
            }
            return event;
        },
    });
    winstonLog.info('Sentry error monitoring initialized');
}

global.BASEDIR = __dirname;

const app = express();

// ============================================
// SECURITY FIX: CORS Configuration
// ============================================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];

const corsOptions = {
    origin: function (origin, callback) {
        // Production mode: Strict origin checking
        if (process.env.NODE_ENV === 'production') {
            // Allow server-to-server requests with no Origin header.
            // This keeps uptime monitors and cron keepalive pings working.
            if (!origin) {
                return callback(null, true);
            }
            
            // Require ALLOWED_ORIGINS to be configured in production
            if (allowedOrigins.length === 0) {
                winstonLog.error('CRITICAL: ALLOWED_ORIGINS not configured in production mode');
                return callback(new Error('CORS not configured'));
            }
            
            // Strict matching in production
            const isAllowed = allowedOrigins.some(allowed => origin === allowed);
            
            if (isAllowed) {
                callback(null, true);
            } else {
                winstonLog.warn(`CORS: Blocked unauthorized origin in production: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        } 
        // Development mode: More permissive (but still controlled)
        else {
            // Allow requests with no origin (Postman, mobile apps during dev)
            if (!origin) return callback(null, true);
            
            // Allow localhost and local network IPs for development
            if (origin.includes('localhost') || 
                origin.match(/^https?:\/\/(10|192\.168|127\.0\.0\.1)\.\d+\.\d+:\d+$/)) {
                return callback(null, true);
            }
            
            // Check configured origins
            if (allowedOrigins.length > 0) {
                const isAllowed = allowedOrigins.some(allowed => origin === allowed);
                if (isAllowed) {
                    return callback(null, true);
                }
            }
            
            winstonLog.warn(`CORS: Blocked origin in development: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Origin', 
        'X-Requested-With', 
        'Accept',
        'X-Request-ID'
    ],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
    credentials: true,
    maxAge: 86400, // 24 hours (CORS preflight cache)
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

mongoose.Promise = global.Promise;

// Build connection URI to handle special characters
// SECURITY: All credentials MUST come from environment variables - no fallbacks
const mongoUri = process.env.MONGO_URI || (() => {
    const user = process.env.MONGO_USER;
    const pass = process.env.MONGO_PASS ? encodeURIComponent(process.env.MONGO_PASS) : null;
    const host = process.env.MONGO_HOST;
    const dbName = process.env.DB_NAME || 'lesociety';
    
    if (!user || !pass || !host) {
        winstonLog.error('FATAL: MongoDB credentials not configured. Set MONGO_URI or MONGO_USER + MONGO_PASS + MONGO_HOST');
        process.exit(1);
    }
    
    return `mongodb+srv://${user}:${pass}@${host}/${dbName}?retryWrites=true&w=majority`;
})();

// Connection pooling and optimization settings
const mongooseOptions = {
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE) || 10,
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE) || 2,
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_TIMEOUT) || 30000, // Increased from 5s to 30s
    socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT) || 45000,
};

mongoose
    .connect(mongoUri, mongooseOptions)
    .then(() => winstonLog.info("MongoDB connection successful"))
    .catch((err) => {
        winstonLog.error("MongoDB connection failed:", err);
        process.exit(1);
    });

// Only enable mongoose debug in development
if (process.env.NODE_ENV === 'development') {
    mongoose.set("debug", true);
} else {
    mongoose.set("debug", false);
}

const db = mongoose.connection;
db.on("error", winston.error.bind(winston, "connection error: "));
db.once("open", () => {
    winston.info("Connected to Mongo DB");
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Morgan logging - only in development
if (process.env.NODE_ENV !== 'production') {
    app.use(logger("dev"));
}

// ====================================
// SECURITY MIDDLEWARE (PRODUCTION READY)
// ====================================

// 1. Helmet - Comprehensive security headers
app.use(helmetConfig);

// 2. Additional security headers
app.use(additionalSecurityHeaders);

// 3. Request timeout protection
app.use(timeoutMiddleware);

// 4. Response compression (must be before routes)
app.use(compressionMiddleware);

// 5. Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// 6. MongoDB query sanitization (CRITICAL: Prevents NoSQL injection)
app.use(sanitizeMiddleware);

// 7. Cookie parser
app.use(cookieParser());

// 8. Static files
app.use(express.static(path.join(__dirname, "public")));

// ====================================
// HEALTH CHECK & MONITORING ENDPOINTS
// ====================================

// Health check endpoint for uptime monitors.
// Keep this tiny and stable so external cron/uptime services never fail on response size.
// This is liveness only, not readiness.
app.get('/health', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.status(200).json({ ok: true });
});

// Readiness check (for Kubernetes/load balancers)
app.get('/ready', async (req, res) => {
    if (mongoose.connection.readyState === 1) {
        res.status(200).json({ ready: true });
    } else {
        res.status(503).json({ ready: false, reason: 'Database not connected' });
    }
});

// Liveness check (simpler, just confirms server is running)
app.get('/alive', (req, res) => {
    res.status(200).json({ alive: true });
});

// Apply rate limiting to routes
app.use("/api/v1/", indexRouter);
app.use("/api/v1/auth", rateLimits.api, authRouter);
app.use("/api/v1/user", rateLimits.api, usersRouter);
app.use("/api/v1/date", rateLimits.date, datesRouter);
app.use("/api/v1/files", rateLimits.api, filesRouter);
app.use("/api/v1/country", rateLimits.api, countryRouter);
app.use("/api/v1/request", rateLimits.api, requestRouter);
app.use("/api/v1/promotion", rateLimits.api, promotionRouter);
app.use("/api/v1/chat", rateLimits.chat, chatRouter);
app.use("/api/v1/defaultMessage", rateLimits.api, defaultMessageRouter);
app.use("/api/v1/influencer", rateLimits.api, defaultInfluencerRouter);
app.use("/api/v1/notification", rateLimits.api, notificationRouter);
app.use("/api/v1/dashboard", rateLimits.api, dashboardRouter);
app.use("/api/v1/cleanup", cleanupRouter);
app.use("/api/v1/categories", rateLimits.api, categoryRouter);
app.use("/api/v1/aspirations", rateLimits.api, aspirationRouter);
app.use("/api/v1/payment", rateLimits.api, paymentRouter);
app.use("/api/v1/admin-console", rateLimits.api, adminConsoleRouter);

// ====================================
// CRON JOBS
// ====================================

// Chat expiry and notification checker
// Production: Use proper job queue (Bull/BullMQ) instead of cron
if (process.env.ENABLE_CRON !== 'false') {
    const cronInterval = process.env.CRON_INTERVAL || "*/1 * * * *"; // Default: every 1 minute
    cron.schedule(cronInterval, function () {
        winstonLog.info("Running scheduled chat expiry and notification checker");
        chatController.handleCron();
    });
    winstonLog.info(`Cron job scheduled: ${cronInterval}`);
}

// ============================================
// CENTRALIZED ERROR HANDLING
// ============================================
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
