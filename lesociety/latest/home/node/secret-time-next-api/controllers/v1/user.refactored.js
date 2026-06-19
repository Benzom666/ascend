/**
 * User Controller (REFACTORED)
 * Thin controller layer - delegates to services
 */

const userService = require('../../services/userService');
const authService = require('../../lib/auth');
const helper = require('../../helpers/helper');
const { asyncHandler, ValidationError } = require('../../middleware/errorHandler');
const { createLogger } = require('../../lib/logger');

const logger = createLogger('user-controller');

/**
 * User login
 * POST /api/v1/user/login
 */
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }

    // Find user
    const user = await userService.findByEmail(email);
    if (!user) {
        return res.status(404).json(
            helper.errorResponse([], 404, 'User not found')
        );
    }

    // Verify password
    const isValidPassword = await userService.verifyPassword(user, password);
    if (!isValidPassword) {
        return res.status(401).json(
            helper.errorResponse([], 401, 'Invalid credentials')
        );
    }

    // Check if user is active
    if (user.status === 0) {
        return res.status(403).json(
            helper.errorResponse([], 403, 'Account is inactive. Please verify your email.')
        );
    }

    // Generate tokens
    const tokens = authService.generateTokenPair({
        _id: user._id,
        email: user.email,
        role: user.role,
        gender: user.gender
    });

    // Update login tracking
    await userService.updateLoginTracking(user._id);

    // Remove password from response
    delete user.password;

    logger.info('User logged in', { userId: user._id, email: user.email });

    res.status(200).json(
        helper.successResponse({
            data: {
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
                ...user
            }
        }, 200, 'Logged in successfully!')
    );
});

/**
 * Get user profile
 * GET /api/v1/user/profile/:userId
 */
exports.getProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await userService.findById(userId);
    delete user.password;

    res.status(200).json(
        helper.successResponse(user, 200, 'Profile retrieved')
    );
});

/**
 * Update user profile
 * PUT /api/v1/user/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
    const userId = req.datajwt?.userdata?._id || req.user?._id;
    
    if (!userId) {
        throw new ValidationError('User ID not found in token');
    }

    const updates = req.body;
    const updatedUser = await userService.updateProfile(userId, updates);
    
    delete updatedUser.password;

    logger.info('Profile updated', { userId });

    res.status(200).json(
        helper.successResponse(updatedUser, 200, 'Profile updated successfully')
    );
});

/**
 * Get user statistics
 * GET /api/v1/user/stats
 */
exports.getUserStats = asyncHandler(async (req, res) => {
    const userId = req.datajwt?.userdata?._id || req.user?._id;

    const stats = await userService.getUserStats(userId);

    res.status(200).json(
        helper.successResponse(stats, 200, 'Stats retrieved')
    );
});

/**
 * Change password
 * POST /api/v1/user/change-password
 */
exports.changePassword = asyncHandler(async (req, res) => {
    const userId = req.datajwt?.userdata?._id || req.user?._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ValidationError('Old password and new password are required');
    }

    if (newPassword.length < 6) {
        throw new ValidationError('New password must be at least 6 characters');
    }

    await userService.updatePassword(userId, oldPassword, newPassword);

    logger.info('Password changed', { userId });

    res.status(200).json(
        helper.successResponse({}, 200, 'Password updated successfully')
    );
});

/**
 * Verify email
 * POST /api/v1/user/verify-email
 */
exports.verifyEmail = asyncHandler(async (req, res) => {
    const { email, token } = req.body;

    if (!token) {
        return res.status(404).json(
            helper.errorResponse([], 404, 'Token required')
        );
    }

    // Find user by token and email
    const User = require('../../models/user');
    const user = await User.findOne({ 
        email_verification_token: token, 
        email: email 
    });

    if (!user) {
        return res.status(404).json(
            helper.errorResponse([], 404, "User doesn't exist or token not matched")
        );
    }

    if (user.email_verification_token === token) {
        // Verify email
        const verifiedUser = await userService.verifyEmail(user._id);

        // Generate tokens
        const tokens = authService.generateTokenPair({
            _id: verifiedUser._id,
            email: verifiedUser.email,
            role: verifiedUser.role,
            gender: verifiedUser.gender
        });

        delete verifiedUser.password;

        logger.info('Email verified', { userId: verifiedUser._id });

        res.status(200).json(
            helper.successResponse({
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                expiresIn: tokens.expiresIn,
                ...verifiedUser
            }, 200, 'Email verified successfully!')
        );
    } else {
        res.status(400).json(
            helper.errorResponse([], 400, 'Invalid verification token')
        );
    }
});

/**
 * Example: Keep other methods as-is but mark for refactoring
 * This shows the pattern - controllers should be thin
 */
