/**
 * Simple In-Memory Cache for API Responses
 * Reduces database load for frequently accessed data
 * Automatically expires entries after TTL
 */

class ApiCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default
    
    // Cleanup expired entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * Generate cache key from request
   */
  generateKey(req) {
    const userId = req.datajwt?.userdata?._id || 'anonymous';
    const path = req.originalUrl || req.url;
    const query = JSON.stringify(req.query);
    return `${userId}:${path}:${query}`;
  }

  /**
   * Get cached response
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cached response
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  /**
   * Delete cached entry
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
const apiCache = new ApiCache();

/**
 * Cache middleware for Express
 * @param {Object} options - Cache options
 * @param {number} options.ttl - Time to live in milliseconds
 * @param {function} options.keyGenerator - Custom key generator function
 */
const cacheMiddleware = (options = {}) => {
  const { ttl = 5 * 60 * 1000, keyGenerator = null } = options;

  return (req, res, next) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = keyGenerator ? keyGenerator(req) : apiCache.generateKey(req);
    const cached = apiCache.get(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache successful responses
    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        apiCache.set(key, data, ttl);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate cache by pattern
 */
const invalidateCache = (pattern) => {
  for (const key of apiCache.cache.keys()) {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  }
};

module.exports = {
  apiCache,
  cacheMiddleware,
  invalidateCache
};
