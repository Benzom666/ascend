/**
 * Authentication Service
 * Centralized JWT token generation and validation
 * Implements secure token practices with refresh tokens
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Token types
 */
const TOKEN_TYPES = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset'
};

/**
 * Token expiry times
 */
const TOKEN_EXPIRY = {
    ACCESS: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    EMAIL_VERIFICATION: '24h',
    PASSWORD_RESET: '1h'
};

/**
 * Get the appropriate JWT secret
 * NOTE: This addresses the JWT_SECRET vs JWT_SECRET_TOKEN inconsistency
 */
function getJWTSecret() {
    // Use JWT_SECRET_TOKEN if available (current production usage)
    // Fall back to JWT_SECRET for backward compatibility
    const secret = process.env.JWT_SECRET_TOKEN || process.env.JWT_SECRET;
    
    if (!secret) {
        throw new Error('JWT secret not configured. Set JWT_SECRET_TOKEN or JWT_SECRET in environment variables.');
    }
    
    if (secret.length < 32) {
        console.warn('WARNING: JWT secret is too short. Use at least 32 characters (64+ recommended).');
    }
    
    return secret;
}

/**
 * Get refresh token secret (separate from access token for security)
 */
function getRefreshSecret() {
    // Use a different secret for refresh tokens if available
    const secret = process.env.JWT_REFRESH_SECRET || getJWTSecret();
    return secret;
}

/**
 * Generate access token (short-lived)
 * @param {Object} payload - User data to encode in token
 * @param {Object} options - Additional JWT options
 * @returns {string} JWT access token
 */
function generateAccessToken(payload, options = {}) {
    try {
        const secret = getJWTSecret();
        
        const tokenPayload = {
            ...payload,
            type: TOKEN_TYPES.ACCESS,
            iat: Math.floor(Date.now() / 1000)
        };
        
        const jwtOptions = {
            expiresIn: TOKEN_EXPIRY.ACCESS,
            ...options
        };
        
        return jwt.sign(tokenPayload, secret, jwtOptions);
    } catch (error) {
        console.error('Error generating access token:', error.message);
        throw new Error('Failed to generate access token');
    }
}

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - User data to encode in token
 * @returns {Object} { token, expiresAt }
 */
function generateRefreshToken(payload) {
    try {
        const secret = getRefreshSecret();
        
        const tokenPayload = {
            userId: payload.userId || payload._id,
            type: TOKEN_TYPES.REFRESH,
            jti: crypto.randomBytes(16).toString('hex'), // Unique token ID
            iat: Math.floor(Date.now() / 1000)
        };
        
        const token = jwt.sign(tokenPayload, secret, {
            expiresIn: TOKEN_EXPIRY.REFRESH
        });
        
        // Calculate expiry timestamp
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        
        return {
            token,
            expiresAt
        };
    } catch (error) {
        console.error('Error generating refresh token:', error.message);
        throw new Error('Failed to generate refresh token');
    }
}

/**
 * Generate email verification token
 * @param {string} email - User email
 * @param {string} userId - User ID
 * @returns {string} Verification token
 */
function generateEmailVerificationToken(email, userId) {
    try {
        const secret = getJWTSecret();
        
        const payload = {
            email,
            userId,
            type: TOKEN_TYPES.EMAIL_VERIFICATION,
            iat: Math.floor(Date.now() / 1000)
        };
        
        return jwt.sign(payload, secret, {
            expiresIn: TOKEN_EXPIRY.EMAIL_VERIFICATION
        });
    } catch (error) {
        console.error('Error generating email verification token:', error.message);
        throw new Error('Failed to generate email verification token');
    }
}

/**
 * Generate password reset token
 * @param {string} email - User email
 * @param {string} userId - User ID
 * @returns {string} Reset token
 */
function generatePasswordResetToken(email, userId) {
    try {
        const secret = getJWTSecret();
        
        const payload = {
            email,
            userId,
            type: TOKEN_TYPES.PASSWORD_RESET,
            iat: Math.floor(Date.now() / 1000)
        };
        
        return jwt.sign(payload, secret, {
            expiresIn: TOKEN_EXPIRY.PASSWORD_RESET
        });
    } catch (error) {
        console.error('Error generating password reset token:', error.message);
        throw new Error('Failed to generate password reset token');
    }
}

/**
 * Verify and decode access token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyAccessToken(token) {
    try {
        const secret = getJWTSecret();
        const decoded = jwt.verify(token, secret);
        
        // Verify token type
        if (decoded.type !== TOKEN_TYPES.ACCESS) {
            throw new Error('Invalid token type');
        }
        
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        throw error;
    }
}

/**
 * Verify and decode refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
function verifyRefreshToken(token) {
    try {
        const secret = getRefreshSecret();
        const decoded = jwt.verify(token, secret);
        
        // Verify token type
        if (decoded.type !== TOKEN_TYPES.REFRESH) {
            throw new Error('Invalid token type');
        }
        
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid refresh token');
        }
        throw error;
    }
}

/**
 * Verify email verification token
 * @param {string} token - Verification token
 * @returns {Object} Decoded payload with email and userId
 */
function verifyEmailVerificationToken(token) {
    try {
        const secret = getJWTSecret();
        const decoded = jwt.verify(token, secret);
        
        if (decoded.type !== TOKEN_TYPES.EMAIL_VERIFICATION) {
            throw new Error('Invalid token type');
        }
        
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Verification token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid verification token');
        }
        throw error;
    }
}

/**
 * Verify password reset token
 * @param {string} token - Reset token
 * @returns {Object} Decoded payload with email and userId
 */
function verifyPasswordResetToken(token) {
    try {
        const secret = getJWTSecret();
        const decoded = jwt.verify(token, secret);
        
        if (decoded.type !== TOKEN_TYPES.PASSWORD_RESET) {
            throw new Error('Invalid token type');
        }
        
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Reset token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid reset token');
        }
        throw error;
    }
}

/**
 * Generate complete token pair (access + refresh)
 * @param {Object} userData - User data for tokens
 * @returns {Object} { accessToken, refreshToken, expiresIn }
 */
function generateTokenPair(userData) {
    const accessToken = generateAccessToken({
        userId: userData._id || userData.userId,
        email: userData.email,
        role: userData.role,
        gender: userData.gender
    });
    
    const { token: refreshToken, expiresAt } = generateRefreshToken({
        userId: userData._id || userData.userId
    });
    
    return {
        accessToken,
        refreshToken,
        expiresIn: TOKEN_EXPIRY.ACCESS,
        refreshExpiresAt: expiresAt
    };
}

module.exports = {
    // Token generation
    generateAccessToken,
    generateRefreshToken,
    generateEmailVerificationToken,
    generatePasswordResetToken,
    generateTokenPair,
    
    // Token verification
    verifyAccessToken,
    verifyRefreshToken,
    verifyEmailVerificationToken,
    verifyPasswordResetToken,
    
    // Constants
    TOKEN_TYPES,
    TOKEN_EXPIRY
};
