/**
 * User Service Layer
 * Business logic for user operations
 * Separates business logic from controllers
 */

const User = require('../models/user');
const bcrypt = require('bcrypt');
const { createLogger } = require('../lib/logger');
const { NotFoundError, ValidationError, ConflictError } = require('../middleware/errorHandler');

const logger = createLogger('user-service');

const DIRECT_UPDATE_BLOCKLIST = new Set([
    'password',
    'email_verified',
    'status',
    'role',
    'verified',
    'verified_screen_shown',
    'request_change_fired',
    'verificationFlag',
    'forcePublish',
]);

const REVIEWED_PROFILE_FIELDS = [
    'first_name',
    'middle_name',
    'last_name',
    'full_name',
    'location',
    'country_code',
    'country',
    'province',
    'age',
    'body_type',
    'ethnicity',
    'height',
    'max_education',
    'is_smoker',
    'occupation',
];

function normalizeImageList(images) {
    if (!images) return [];
    if (Array.isArray(images)) {
        return images.filter((item) => typeof item === 'string' && item.trim().length > 0);
    }
    if (typeof images === 'string') {
        return images.trim().length > 0 ? [images.trim()] : [];
    }
    return [];
}

class UserService {
    /**
     * Find user by email
     */
    async findByEmail(email) {
        const user = await User.findOne({ email }).lean();
        return user;
    }

    /**
     * Find user by ID
     */
    async findById(userId) {
        const user = await User.findById(userId).lean();
        if (!user) {
            throw new NotFoundError('User');
        }
        return user;
    }

    /**
     * Find user by username
     */
    async findByUsername(username) {
        const user = await User.findOne({ user_name: username }).lean();
        return user;
    }

    /**
     * Create new user
     */
    async createUser(userData) {
        // Check if user already exists
        const existingEmail = await this.findByEmail(userData.email);
        if (existingEmail) {
            throw new ConflictError('Email already registered');
        }

        const existingUsername = await this.findByUsername(userData.user_name);
        if (existingUsername) {
            throw new ConflictError('Username already taken');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const user = new User({
            ...userData,
            password: hashedPassword
        });

        const savedUser = await user.save();
        logger.info('User created', { userId: savedUser._id, email: savedUser.email });

        return savedUser;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, updates) {
        const sanitizedUpdates = { ...updates };
        DIRECT_UPDATE_BLOCKLIST.forEach((field) => {
            delete sanitizedUpdates[field];
        });

        const user = await User.findById(userId);

        if (!user) {
            throw new NotFoundError('User');
        }

        const requiresVerification = user.status === 2 || user.verified === true;
        const verificationFlag = updates?.verificationFlag === true;

        if (!requiresVerification) {
            Object.assign(user, sanitizedUpdates);
            await user.save();

            logger.info('User profile updated directly', { userId });
            return user.toObject();
        }

        const pendingProfileDetails = { ...(user.un_verified_profile_details || {}) };
        let hasQueuedChanges = false;

        if (Object.prototype.hasOwnProperty.call(sanitizedUpdates, 'images')) {
            const nextImages = normalizeImageList(sanitizedUpdates.images);
            if (nextImages.length > 0 && JSON.stringify(nextImages) !== JSON.stringify(user.images || [])) {
                user.un_verified_images = nextImages;
                user.image_verified = false;
                hasQueuedChanges = true;
            }
            delete sanitizedUpdates.images;
        }

        if (Object.prototype.hasOwnProperty.call(sanitizedUpdates, 'tagline')) {
            const nextTagline = typeof sanitizedUpdates.tagline === 'string' ? sanitizedUpdates.tagline : '';
            if (nextTagline !== (user.tagline || '')) {
                user.un_verified_tagline = nextTagline;
                user.tag_desc_verified = false;
                hasQueuedChanges = true;
            }
            delete sanitizedUpdates.tagline;
        }

        if (Object.prototype.hasOwnProperty.call(sanitizedUpdates, 'description')) {
            const nextDescription =
                typeof sanitizedUpdates.description === 'string' ? sanitizedUpdates.description : '';
            if (nextDescription !== (user.description || '')) {
                user.un_verified_description = nextDescription;
                user.tag_desc_verified = false;
                hasQueuedChanges = true;
            }
            delete sanitizedUpdates.description;
        }

        REVIEWED_PROFILE_FIELDS.forEach((field) => {
            if (!Object.prototype.hasOwnProperty.call(sanitizedUpdates, field)) return;

            if (sanitizedUpdates[field] !== user[field]) {
                pendingProfileDetails[field] = sanitizedUpdates[field];
                hasQueuedChanges = true;
            }
            delete sanitizedUpdates[field];
        });

        const unexpectedDirectFields = Object.keys(sanitizedUpdates);
        if (unexpectedDirectFields.length > 0) {
            throw new ValidationError(
                `Direct profile publishing is not allowed for verified users: ${unexpectedDirectFields.join(', ')}`
            );
        }

        if (hasQueuedChanges && !verificationFlag) {
            throw new ValidationError(
                'Verified profile updates must set verificationFlag=true so the change is routed for admin review'
            );
        }

        user.un_verified_profile_details = pendingProfileDetails;

        if (hasQueuedChanges) {
            user.request_change_fired = false;
        }

        await user.save();

        logger.info('User profile update queued for review', { userId, hasQueuedChanges });
        return user.toObject();
    }

    /**
     * Verify password
     */
    async verifyPassword(user, password) {
        const isValid = await bcrypt.compare(password, user.password);
        return isValid;
    }

    /**
     * Update password
     */
    async updatePassword(userId, oldPassword, newPassword) {
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User');
        }

        // Verify old password
        const isValid = await this.verifyPassword(user, oldPassword);
        if (!isValid) {
            throw new ValidationError('Current password is incorrect');
        }

        // Hash new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        logger.info('Password updated', { userId });
        return true;
    }

    /**
     * Update user tokens
     */
    async updateTokens(userId, tokenUpdates) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $inc: tokenUpdates },
            { new: true }
        ).lean();

        if (!user) {
            throw new NotFoundError('User');
        }

        return user;
    }

    /**
     * Deduct tokens (with validation)
     */
    async deductTokens(userId, tokenType, amount = 1) {
        const validTokenTypes = ['interested_tokens', 'super_interested_tokens', 'chat_tokens'];
        
        if (!validTokenTypes.includes(tokenType)) {
            throw new ValidationError(`Invalid token type: ${tokenType}`);
        }

        const user = await User.findOneAndUpdate(
            { _id: userId, [tokenType]: { $gte: amount } },
            { $inc: { [tokenType]: -amount } },
            { new: true }
        ).lean();

        if (!user) {
            throw new ValidationError(`Insufficient ${tokenType.replace('_', ' ')}`);
        }

        logger.debug('Tokens deducted', { userId, tokenType, amount });
        return user;
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId) {
        const user = await this.findById(userId);
        
        return {
            interested_tokens: user.interested_tokens || 0,
            super_interested_tokens: user.super_interested_tokens || 0,
            chat_tokens: user.chat_tokens || 0,
            remaining_chats: user.remaining_chats || 0,
            profile_completion: this.calculateProfileCompletion(user)
        };
    }

    /**
     * Calculate profile completion percentage
     */
    calculateProfileCompletion(user) {
        const requiredFields = ['full_name', 'gender', 'age', 'location', 'bio', 'photos'];
        const completedFields = requiredFields.filter(field => {
            if (field === 'photos') {
                return user.photos && user.photos.length > 0;
            }
            return user[field] && user[field].trim().length > 0;
        });

        return Math.round((completedFields.length / requiredFields.length) * 100);
    }

    /**
     * Verify email
     */
    async verifyEmail(userId) {
        const user = await User.findByIdAndUpdate(
            userId,
            { 
                $set: { 
                    email_verified: true,
                    email_verification_token: null 
                } 
            },
            { new: true }
        ).lean();

        if (!user) {
            throw new NotFoundError('User');
        }

        logger.info('Email verified', { userId, email: user.email });
        return user;
    }

    /**
     * Update login tracking
     */
    async updateLoginTracking(userId) {
        const currentTime = new Date();
        
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User');
        }

        user.before_last_logged_in = user.last_logged_in;
        user.last_logged_in = currentTime;
        await user.save();

        return user;
    }
}

module.exports = new UserService();
