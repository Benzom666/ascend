/**
 * Authentication Routes
 * Handles token refresh and logout
 */

const express = require('express');
const router = express.Router();
const authService = require('../lib/auth');
const helper = require('../helpers/helper');
const User = require('../models/user');

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json(
                helper.errorResponse([], 400, 'Refresh token required')
            );
        }
        
        // Verify refresh token
        const decoded = authService.verifyRefreshToken(refreshToken);
        
        // Get user from database to ensure still valid
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json(
                helper.errorResponse([], 404, 'User not found')
            );
        }
        
        if (user.status === 0) {
            return res.status(403).json(
                helper.errorResponse([], 403, 'Account is inactive')
            );
        }
        
        // Generate new access token
        const accessToken = authService.generateAccessToken({
            userId: user._id,
            email: user.email,
            role: user.role,
            gender: user.gender
        });
        
        res.status(200).json(
            helper.successResponse({
                data: {
                    accessToken,
                    expiresIn: authService.TOKEN_EXPIRY.ACCESS
                }
            }, 200, 'Token refreshed successfully')
        );
        
    } catch (error) {
        if (error.message === 'Refresh token expired') {
            return res.status(401).json(
                helper.errorResponse([], 401, 'Refresh token expired. Please login again.')
            );
        }
        
        return res.status(401).json(
            helper.errorResponse([], 401, 'Invalid refresh token')
        );
    }
});

/**
 * POST /api/v1/auth/logout
 * Logout user (client-side token deletion is primary mechanism)
 */
router.post('/logout', (req, res) => {
    // In a stateless JWT setup, logout is primarily client-side
    // For enhanced security, you could maintain a token blacklist in Redis
    
    res.status(200).json(
        helper.successResponse({}, 200, 'Logged out successfully')
    );
});

module.exports = router;
