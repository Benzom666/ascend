/**
 * Environment Variable Validator
 * Validates required environment variables at startup
 * Fails fast if critical configuration is missing
 */

const chalk = require('chalk');

/**
 * Required environment variables by category
 */
const REQUIRED_ENV_VARS = {
    // Critical - App won't start without these
    critical: [
        'MONGO_USER',
        'MONGO_PASS',
        'MONGO_HOST',
        'DB_NAME',
        'JWT_SECRET',
        'JWT_SECRET_TOKEN',
        'NODE_ENV',
        'PORT'
    ],
    
    // Important - App will start but features won't work
    important: [
        'ALLOWED_ORIGINS',
        'APP_URL',
        'SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY',
        'SUPABASE_STORAGE_BUCKET'
    ],
    
    // Optional - Nice to have
    optional: [
        'SENDGRID_API_KEY',
        'BUCKSBUS_API_KEY',
        'BUCKSBUS_API_SECRET',
        'SENTRY_DSN',
        'REDIS_URL'
    ]
};

/**
 * Security validation rules
 */
const SECURITY_RULES = {
    JWT_SECRET: {
        minLength: 32,
        message: 'JWT_SECRET must be at least 32 characters (64+ recommended)'
    },
    JWT_SECRET_TOKEN: {
        minLength: 32,
        message: 'JWT_SECRET_TOKEN must be at least 32 characters (64+ recommended)'
    },
    MONGO_PASS: {
        minLength: 12,
        message: 'MONGO_PASS should be at least 12 characters for security'
    }
};

/**
 * Validate environment variables
 * @param {Object} options - Validation options
 * @param {boolean} options.strict - Exit process on validation failure
 * @returns {Object} Validation results
 */
function validateEnvironment(options = { strict: true }) {
    const errors = [];
    const warnings = [];
    const missing = {
        critical: [],
        important: [],
        optional: []
    };

    console.log(chalk.blue('\n🔍 Validating environment configuration...\n'));

    // Check critical variables
    REQUIRED_ENV_VARS.critical.forEach(varName => {
        if (!process.env[varName]) {
            errors.push(`Missing CRITICAL variable: ${varName}`);
            missing.critical.push(varName);
        } else {
            // Check security rules
            const rule = SECURITY_RULES[varName];
            if (rule && process.env[varName].length < rule.minLength) {
                warnings.push(`SECURITY: ${rule.message}`);
            }
        }
    });

    // Check important variables
    REQUIRED_ENV_VARS.important.forEach(varName => {
        if (!process.env[varName]) {
            warnings.push(`Missing IMPORTANT variable: ${varName} (features may not work)`);
            missing.important.push(varName);
        }
    });

    // Check optional variables
    REQUIRED_ENV_VARS.optional.forEach(varName => {
        if (!process.env[varName]) {
            missing.optional.push(varName);
        }
    });

    // Special validations
    validateJWTSecrets(errors, warnings);
    validateMongoConnection(errors, warnings);
    validateCORS(warnings);
    validateNodeEnv(warnings);

    // Print results
    printValidationResults(errors, warnings, missing);

    // Decide whether to exit
    if (errors.length > 0) {
        console.error(chalk.red('\n❌ Environment validation FAILED - Cannot start application\n'));
        
        if (options.strict) {
            console.error(chalk.yellow('💡 Quick fix:\n'));
            console.error(chalk.yellow('   1. Copy .env.example to .env'));
            console.error(chalk.yellow('   2. Fill in required values'));
            console.error(chalk.yellow('   3. Restart the application\n'));
            process.exit(1);
        }
        
        return { valid: false, errors, warnings, missing };
    }

    if (warnings.length > 0) {
        console.warn(chalk.yellow('⚠️  Environment validation passed with WARNINGS\n'));
    } else {
        console.log(chalk.green('✅ Environment validation passed\n'));
    }

    return { valid: true, errors: [], warnings, missing };
}

/**
 * Validate JWT secrets are different and strong
 */
function validateJWTSecrets(errors, warnings) {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtSecretToken = process.env.JWT_SECRET_TOKEN;

    if (jwtSecret && jwtSecretToken && jwtSecret === jwtSecretToken) {
        errors.push('JWT_SECRET and JWT_SECRET_TOKEN must be different values');
    }

    // Check for common weak secrets
    const weakSecrets = ['secret', 'password', 'changeme', 'your-secret', 'your_secret'];
    if (jwtSecret && weakSecrets.some(weak => jwtSecret.toLowerCase().includes(weak))) {
        errors.push('JWT_SECRET appears to be a weak/default value - generate a strong random secret');
    }
    if (jwtSecretToken && weakSecrets.some(weak => jwtSecretToken.toLowerCase().includes(weak))) {
        errors.push('JWT_SECRET_TOKEN appears to be a weak/default value - generate a strong random secret');
    }
}

/**
 * Validate MongoDB connection parameters
 */
function validateMongoConnection(errors, warnings) {
    const mongoUser = process.env.MONGO_USER;
    const mongoPass = process.env.MONGO_PASS;
    const mongoHost = process.env.MONGO_HOST;

    if (mongoUser && mongoPass && mongoHost) {
        // Check for placeholder values
        if (mongoUser.includes('your_') || mongoUser.includes('username')) {
            errors.push('MONGO_USER appears to be a placeholder value');
        }
        if (mongoPass.includes('your_') || mongoPass.includes('password')) {
            errors.push('MONGO_PASS appears to be a placeholder value');
        }
        if (mongoHost.includes('your-cluster') || mongoHost.includes('your_')) {
            errors.push('MONGO_HOST appears to be a placeholder value');
        }
    }
}

/**
 * Validate CORS configuration
 */
function validateCORS(warnings) {
    const origins = process.env.ALLOWED_ORIGINS;
    
    if (origins && process.env.NODE_ENV === 'production') {
        if (origins.includes('localhost')) {
            warnings.push('ALLOWED_ORIGINS includes localhost in production mode');
        }
        if (origins.includes('*')) {
            warnings.push('ALLOWED_ORIGINS includes wildcard (*) - this is insecure');
        }
    }
}

/**
 * Validate NODE_ENV
 */
function validateNodeEnv(warnings) {
    const nodeEnv = process.env.NODE_ENV;
    const validEnvs = ['development', 'production', 'staging', 'test'];
    
    if (nodeEnv && !validEnvs.includes(nodeEnv)) {
        warnings.push(`NODE_ENV="${nodeEnv}" is non-standard. Use: ${validEnvs.join(', ')}`);
    }
}

/**
 * Print validation results in a readable format
 */
function printValidationResults(errors, warnings, missing) {
    if (errors.length > 0) {
        console.error(chalk.red.bold('\n❌ CRITICAL ERRORS:\n'));
        errors.forEach(err => console.error(chalk.red(`   • ${err}`)));
    }

    if (warnings.length > 0) {
        console.warn(chalk.yellow.bold('\n⚠️  WARNINGS:\n'));
        warnings.forEach(warn => console.warn(chalk.yellow(`   • ${warn}`)));
    }

    if (missing.critical.length > 0) {
        console.error(chalk.red.bold('\n🚨 Missing CRITICAL variables:\n'));
        missing.critical.forEach(v => console.error(chalk.red(`   • ${v}`)));
    }

    if (missing.important.length > 0) {
        console.warn(chalk.yellow.bold('\n⚠️  Missing IMPORTANT variables:\n'));
        missing.important.forEach(v => console.warn(chalk.yellow(`   • ${v}`)));
    }

    if (missing.optional.length > 0 && process.env.NODE_ENV === 'production') {
        console.log(chalk.gray.bold('\nℹ️  Missing OPTIONAL variables (recommended for production):\n'));
        missing.optional.forEach(v => console.log(chalk.gray(`   • ${v}`)));
    }
}

/**
 * Generate secure environment variable values
 */
function generateSecureValues() {
    const crypto = require('crypto');
    
    console.log(chalk.blue('\n🔐 Generating secure environment variable values:\n'));
    console.log(chalk.white('JWT_SECRET=' + crypto.randomBytes(64).toString('base64')));
    console.log(chalk.white('JWT_SECRET_TOKEN=' + crypto.randomBytes(64).toString('base64')));
    console.log(chalk.white('SESSION_SECRET=' + crypto.randomBytes(32).toString('base64')));
    console.log(chalk.white('MONGO_PASS=' + crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, '')));
    console.log(chalk.gray('\n💡 Copy these values to your .env file\n'));
}

// Export validator
module.exports = {
    validateEnvironment,
    generateSecureValues,
    REQUIRED_ENV_VARS,
    SECURITY_RULES
};

// CLI usage
if (require.main === module) {
    require('dotenv').config();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--generate')) {
        generateSecureValues();
    } else {
        validateEnvironment({ strict: true });
    }
}
