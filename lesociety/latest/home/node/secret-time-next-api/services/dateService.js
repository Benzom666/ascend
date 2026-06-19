/**
 * Date Service Layer
 * Business logic for date operations
 */

const Date = require('../models/dates');
const { createLogger } = require('../lib/logger');
const { NotFoundError, ValidationError, AuthorizationError } = require('../middleware/errorHandler');

const logger = createLogger('date-service');

class DateService {
    /**
     * Get active dates with filters
     */
    async getActiveDates(filters = {}, pagination = {}) {
        const {
            location,
            country_code,
            province,
            category,
            min_price,
            max_price
        } = filters;

        const {
            page = 1,
            limit = 20,
            sort = { created_date: -1 }
        } = pagination;

        const skip = (page - 1) * limit;

        // Build query
        const query = {
            status: 2, // Only active dates
            date_status: true // Not draft
        };

        if (location) {
            query.location = { $regex: new RegExp(location, 'i') };
        }
        if (country_code) {
            query.country_code = country_code;
        }
        if (province) {
            query.province = province;
        }
        if (category) {
            query.category = category;
        }
        if (min_price !== undefined || max_price !== undefined) {
            query.price = {};
            if (min_price !== undefined) query.price.$gte = min_price;
            if (max_price !== undefined) query.price.$lte = max_price;
        }

        const [dates, total] = await Promise.all([
            Date.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('user_id', 'full_name photos location')
                .lean(),
            Date.countDocuments(query)
        ]);

        return {
            dates,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get date by ID
     */
    async getDateById(dateId) {
        const date = await Date.findById(dateId)
            .populate('user_id', 'full_name photos location age')
            .lean();

        if (!date) {
            throw new NotFoundError('Date');
        }

        return date;
    }

    /**
     * Create new date
     */
    async createDate(userId, dateData) {
        const date = new Date({
            ...dateData,
            user_id: userId,
            status: 2, // Active by default (no admin approval needed)
            date_status: true
        });

        const savedDate = await date.save();
        logger.info('Date created', { dateId: savedDate._id, userId });

        return savedDate;
    }

    /**
     * Update date
     */
    async updateDate(dateId, userId, updates) {
        const date = await Date.findById(dateId);

        if (!date) {
            throw new NotFoundError('Date');
        }

        // Check ownership
        if (date.user_id.toString() !== userId.toString()) {
            throw new AuthorizationError('You can only update your own dates');
        }

        // Apply updates
        Object.assign(date, updates);
        await date.save();

        logger.info('Date updated', { dateId, userId });
        return date;
    }

    /**
     * Delete date
     */
    async deleteDate(dateId, userId) {
        const date = await Date.findById(dateId);

        if (!date) {
            throw new NotFoundError('Date');
        }

        // Check ownership
        if (date.user_id.toString() !== userId.toString()) {
            throw new AuthorizationError('You can only delete your own dates');
        }

        await Date.findByIdAndDelete(dateId);
        logger.info('Date deleted', { dateId, userId });

        return true;
    }

    /**
     * Get user's dates
     */
    async getUserDates(userId, includeInactive = false) {
        const query = { user_id: userId };
        
        if (!includeInactive) {
            query.status = 2;
            query.date_status = true;
        }

        const dates = await Date.find(query)
            .sort({ created_date: -1 })
            .lean();

        return dates;
    }

    /**
     * Toggle date status (activate/deactivate)
     */
    async toggleDateStatus(dateId, userId) {
        const date = await Date.findById(dateId);

        if (!date) {
            throw new NotFoundError('Date');
        }

        if (date.user_id.toString() !== userId.toString()) {
            throw new AuthorizationError('You can only modify your own dates');
        }

        date.date_status = !date.date_status;
        await date.save();

        logger.info('Date status toggled', { 
            dateId, 
            userId, 
            newStatus: date.date_status 
        });

        return date;
    }
}

module.exports = new DateService();
