/**
 * Cache Warming Strategy
 * Pre-loads frequently accessed data into memory/Redis
 */

const Country = require('../models/country');
const Category = require('../models/category');
const Aspiration = require('../models/aspiration');
const DefaultMessage = require('../models/default-messages');

// In-memory cache (use Redis in production)
let cache = {
    countries: null,
    categories: null,
    aspirations: null,
    defaultMessages: null,
    lastWarmed: null,
};

/**
 * Cache TTL (Time To Live) in milliseconds
 */
const CACHE_TTL = {
    countries: 24 * 60 * 60 * 1000,      // 24 hours
    categories: 24 * 60 * 60 * 1000,     // 24 hours
    aspirations: 24 * 60 * 60 * 1000,    // 24 hours
    defaultMessages: 12 * 60 * 60 * 1000, // 12 hours
};

/**
 * Warm all caches on startup
 */
async function warmAllCaches() {
    console.log('🔥 Warming caches...');
    const start = Date.now();
    
    try {
        await Promise.all([
            warmCountriesCache(),
            warmCategoriesCache(),
            warmAspirationsCache(),
            warmDefaultMessagesCache(),
        ]);
        
        cache.lastWarmed = new Date();
        const duration = Date.now() - start;
        
        console.log(`✓ All caches warmed in ${duration}ms`);
        return true;
    } catch (error) {
        console.error('✗ Cache warming failed:', error);
        return false;
    }
}

/**
 * Warm countries cache
 */
async function warmCountriesCache() {
    try {
        const countries = await Country.find({ deleted_date: null })
            .select('name country_code')
            .lean()
            .exec();
        
        cache.countries = {
            data: countries,
            warmedAt: Date.now(),
        };
        
        console.log(`  ✓ Countries cache warmed (${countries.length} items)`);
        return true;
    } catch (error) {
        console.error('  ✗ Countries cache warming failed:', error);
        return false;
    }
}

/**
 * Warm categories cache
 */
async function warmCategoriesCache() {
    try {
        const categories = await Category.find({ deleted_date: null })
            .select('name description')
            .lean()
            .exec();
        
        cache.categories = {
            data: categories,
            warmedAt: Date.now(),
        };
        
        console.log(`  ✓ Categories cache warmed (${categories.length} items)`);
        return true;
    } catch (error) {
        console.error('  ✗ Categories cache warming failed:', error);
        return false;
    }
}

/**
 * Warm aspirations cache
 */
async function warmAspirationsCache() {
    try {
        const aspirations = await Aspiration.find({ deleted_date: null })
            .select('name')
            .lean()
            .exec();
        
        cache.aspirations = {
            data: aspirations,
            warmedAt: Date.now(),
        };
        
        console.log(`  ✓ Aspirations cache warmed (${aspirations.length} items)`);
        return true;
    } catch (error) {
        console.error('  ✗ Aspirations cache warming failed:', error);
        return false;
    }
}

/**
 * Warm default messages cache
 */
async function warmDefaultMessagesCache() {
    try {
        const messages = await DefaultMessage.find({ deleted_date: null })
            .select('type message')
            .lean()
            .exec();
        
        cache.defaultMessages = {
            data: messages,
            warmedAt: Date.now(),
        };
        
        console.log(`  ✓ Default messages cache warmed (${messages.length} items)`);
        return true;
    } catch (error) {
        console.error('  ✗ Default messages cache warming failed:', error);
        return false;
    }
}

/**
 * Get cached countries
 */
function getCachedCountries() {
    if (!cache.countries || isCacheExpired('countries', cache.countries.warmedAt)) {
        return null;
    }
    return cache.countries.data;
}

/**
 * Get cached categories
 */
function getCachedCategories() {
    if (!cache.categories || isCacheExpired('categories', cache.categories.warmedAt)) {
        return null;
    }
    return cache.categories.data;
}

/**
 * Get cached aspirations
 */
function getCachedAspirations() {
    if (!cache.aspirations || isCacheExpired('aspirations', cache.aspirations.warmedAt)) {
        return null;
    }
    return cache.aspirations.data;
}

/**
 * Get cached default messages
 */
function getCachedDefaultMessages() {
    if (!cache.defaultMessages || isCacheExpired('defaultMessages', cache.defaultMessages.warmedAt)) {
        return null;
    }
    return cache.defaultMessages.data;
}

/**
 * Check if cache is expired
 */
function isCacheExpired(cacheType, warmedAt) {
    const ttl = CACHE_TTL[cacheType] || 3600000; // Default 1 hour
    return Date.now() - warmedAt > ttl;
}

/**
 * Invalidate specific cache
 */
function invalidateCache(cacheType) {
    if (cache[cacheType]) {
        cache[cacheType] = null;
        console.log(`Cache invalidated: ${cacheType}`);
    }
}

/**
 * Invalidate all caches
 */
function invalidateAllCaches() {
    cache = {
        countries: null,
        categories: null,
        aspirations: null,
        defaultMessages: null,
        lastWarmed: null,
    };
    console.log('All caches invalidated');
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    return {
        lastWarmed: cache.lastWarmed,
        countries: cache.countries ? {
            items: cache.countries.data.length,
            warmedAt: new Date(cache.countries.warmedAt),
            expired: isCacheExpired('countries', cache.countries.warmedAt),
        } : null,
        categories: cache.categories ? {
            items: cache.categories.data.length,
            warmedAt: new Date(cache.categories.warmedAt),
            expired: isCacheExpired('categories', cache.categories.warmedAt),
        } : null,
        aspirations: cache.aspirations ? {
            items: cache.aspirations.data.length,
            warmedAt: new Date(cache.aspirations.warmedAt),
            expired: isCacheExpired('aspirations', cache.aspirations.warmedAt),
        } : null,
        defaultMessages: cache.defaultMessages ? {
            items: cache.defaultMessages.data.length,
            warmedAt: new Date(cache.defaultMessages.warmedAt),
            expired: isCacheExpired('defaultMessages', cache.defaultMessages.warmedAt),
        } : null,
    };
}

/**
 * Schedule periodic cache refresh
 */
function schedulePeriodicRefresh() {
    // Refresh every 6 hours
    const refreshInterval = 6 * 60 * 60 * 1000;
    
    setInterval(async () => {
        console.log('Scheduled cache refresh...');
        await warmAllCaches();
    }, refreshInterval);
    
    console.log(`Scheduled cache refresh every ${refreshInterval / 1000 / 60 / 60} hours`);
}

module.exports = {
    warmAllCaches,
    warmCountriesCache,
    warmCategoriesCache,
    warmAspirationsCache,
    warmDefaultMessagesCache,
    getCachedCountries,
    getCachedCategories,
    getCachedAspirations,
    getCachedDefaultMessages,
    invalidateCache,
    invalidateAllCaches,
    getCacheStats,
    schedulePeriodicRefresh,
};
