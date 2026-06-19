/**
 * Pagination Helper
 * Ensures all database queries have proper limits to prevent memory issues
 */

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 1000;
const DEFAULT_PAGE = 1;

/**
 * Parse and validate pagination parameters
 * @param {Object} query - Request query object
 * @returns {Object} - { limit, skip, page }
 */
function getPaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
    const limit = Math.min(
        Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT),
        MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    return { limit, skip, page };
}

/**
 * Apply pagination to a Mongoose query
 * @param {Query} query - Mongoose query object
 * @param {Object} params - Request query parameters
 * @returns {Query} - Query with pagination applied
 */
function applyPagination(query, params) {
    const { limit, skip } = getPaginationParams(params);
    return query.limit(limit).skip(skip);
}

/**
 * Get paginated response object
 * @param {Array} data - Data array
 * @param {Number} total - Total count
 * @param {Object} params - Request query parameters
 * @returns {Object} - Paginated response
 */
function getPaginatedResponse(data, total, params) {
    const { limit, page } = getPaginationParams(params);
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
}

/**
 * Execute a paginated query
 * @param {Model} Model - Mongoose model
 * @param {Object} filter - Query filter
 * @param {Object} params - Request query parameters
 * @param {Object} options - Additional options (select, populate, sort)
 * @returns {Promise<Object>} - Paginated results
 */
async function paginatedQuery(Model, filter = {}, params = {}, options = {}) {
    const { limit, skip } = getPaginationParams(params);
    
    let query = Model.find(filter);
    
    // Apply options
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate);
    if (options.sort) query = query.sort(options.sort);
    
    // Apply pagination and lean for better performance
    query = query.limit(limit).skip(skip).lean();
    
    // Execute query and count in parallel
    const [data, total] = await Promise.all([
        query.exec(),
        Model.countDocuments(filter),
    ]);
    
    return getPaginatedResponse(data, total, params);
}

module.exports = {
    DEFAULT_LIMIT,
    MAX_LIMIT,
    DEFAULT_PAGE,
    getPaginationParams,
    applyPagination,
    getPaginatedResponse,
    paginatedQuery,
};
