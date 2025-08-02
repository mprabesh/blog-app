/**
 * Redis Cache Middleware Module
 * 
 * This module provides Express middleware functions for caching API responses
 * and managing cache invalidation. It improves application performance by
 * reducing database queries for frequently accessed data.
 * 
 * Features:
 * - Response caching with configurable TTL
 * - Cache invalidation on data modifications
 * - Automatic cache key generation
 * - Error handling and fallback behavior
 * - Support for different cache strategies
 */

const { cache } = require('../utils/redis');
const logger = require('../utils/logger');

/**
 * Cache Response Middleware
 * 
 * Middleware to cache GET request responses and serve cached data
 * for subsequent identical requests within the TTL period.
 * 
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 * @param {string} keyPrefix - Prefix for cache keys (default: 'api')
 * @returns {Function} Express middleware function
 */
const cacheResponse = (ttl = 300, keyPrefix = 'api') => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key from request path and query parameters
      const cacheKey = generateCacheKey(req, keyPrefix);
      
      // Try to get cached response
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        logger.info(`📖 Cache hit: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Cache miss - continue to route handler
      logger.debug(`📭 Cache miss: ${cacheKey}`);
      
      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = function(data) {
        // Cache the response data
        cache.set(cacheKey, data, ttl).catch(err => {
          logger.error('❌ Cache set error:', err.message);
        });
        
        // Send the response
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('❌ Cache middleware error:', error.message);
      next(); // Continue without caching on error
    }
  };
};

/**
 * Cache Invalidation Middleware
 * 
 * Middleware to invalidate cache entries when data is modified.
 * Used on POST, PUT, DELETE requests to ensure cache consistency.
 * 
 * @param {string|Array} patterns - Cache key patterns to invalidate
 * @returns {Function} Express middleware function
 */
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store patterns to invalidate after successful response
    res.locals.cachePatterns = Array.isArray(patterns) ? patterns : [patterns];
    
    // Override res.json to invalidate cache after successful response
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      // Only invalidate cache for successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        invalidateCachePatterns(res.locals.cachePatterns);
      }
      
      return originalJson(data);
    };

    next();
  };
};

/**
 * Blog-specific Cache Middleware
 * 
 * Pre-configured cache middleware for blog endpoints with
 * appropriate TTL and key prefixes.
 */
const blogCache = {
  // Cache all blogs list for 5 minutes
  list: cacheResponse(300, 'blogs'),
  
  // Cache individual blog posts for 15 minutes
  single: cacheResponse(900, 'blog'),
  
  // Cache user's blogs for 10 minutes
  userBlogs: cacheResponse(600, 'user-blogs'),
  
  // Cache popular/trending blogs for 30 minutes
  popular: cacheResponse(1800, 'popular-blogs')
};

/**
 * Blog Cache Invalidation Patterns
 * 
 * Pre-defined cache invalidation patterns for different blog operations.
 */
const blogInvalidation = {
  // Invalidate all blog-related caches when creating/updating/deleting blogs
  all: invalidateCache(['blogs:*', 'blog:*', 'user-blogs:*', 'popular-blogs:*']),
  
  // Invalidate specific user's blog cache
  user: (userId) => invalidateCache([`user-blogs:*${userId}*`, 'blogs:*']),
  
  // Invalidate specific blog cache
  single: (blogId) => invalidateCache([`blog:*${blogId}*`, 'blogs:*'])
};

/**
 * Helper Functions
 */

/**
 * Generate cache key from request
 * 
 * @param {Object} req - Express request object
 * @param {string} prefix - Key prefix
 * @returns {string} Generated cache key
 */
function generateCacheKey(req, prefix) {
  const path = req.path.replace(/\//g, ':');
  const query = Object.keys(req.query).length > 0 
    ? ':' + JSON.stringify(req.query)
    : '';
  
  return `${prefix}${path}${query}`;
}

/**
 * Invalidate cache patterns
 * 
 * @param {Array} patterns - Array of cache key patterns to invalidate
 */
async function invalidateCachePatterns(patterns) {
  try {
    for (const pattern of patterns) {
      await cache.clearPattern(pattern);
      logger.debug(`🧹 Cache invalidated: ${pattern}`);
    }
  } catch (error) {
    logger.error('❌ Cache invalidation error:', error.message);
  }
}

/**
 * User Session Cache Functions
 * 
 * Helper functions for caching user session data and authentication info.
 */
const sessionCache = {
  /**
   * Cache user session data
   * 
   * @param {string} userId - User ID
   * @param {Object} userData - User data to cache
   * @param {number} ttl - TTL in seconds (default: 1 hour)
   */
  setUser: async (userId, userData, ttl = 3600) => {
    await cache.set(`user:${userId}`, userData, ttl);
  },

  /**
   * Get cached user session data
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Cached user data
   */
  getUser: async (userId) => {
    return await cache.get(`user:${userId}`);
  },

  /**
   * Invalidate user session cache
   * 
   * @param {string} userId - User ID
   */
  invalidateUser: async (userId) => {
    await cache.del(`user:${userId}`);
  }
};

module.exports = {
  cacheResponse,
  invalidateCache,
  blogCache,
  blogInvalidation,
  sessionCache
};
