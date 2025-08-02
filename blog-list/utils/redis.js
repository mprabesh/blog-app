/**
 * Redis Configuration and Client Setup
 * 
 * This module provides Redis client configuration and connection management
 * for the blog application. It handles caching operations, session storage,
 * and real-time data management.
 * 
 * Features:
 * - Automatic connection management with retry logic
 * - Environment-based configuration
 * - Error handling and logging
 * - Connection health monitoring
 * - Graceful shutdown handling
 */

const { createClient } = require('redis');
const logger = require('./logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000; // 1 second
  }

  /**
   * Initialize Redis connection
   * 
   * Creates and configures Redis client with environment-based settings.
   * Includes automatic retry logic and error handling.
   */
  async connect() {
    try {
      // Get Redis URL from environment variables
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      logger.info('🔄 Connecting to Redis...', { url: redisUrl.replace(/\/\/.*@/, '//***@') });
      
      // Create Redis client
      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > this.maxRetries) {
              logger.error('❌ Redis connection failed after max retries');
              return false;
            }
            const delay = Math.min(retries * this.retryDelay, 5000);
            logger.warn(`🔄 Redis reconnection attempt ${retries} in ${delay}ms`);
            return delay;
          }
        }
      });

      // Set up event listeners
      this.setupEventListeners();

      // Connect to Redis
      await this.client.connect();
      
      this.isConnected = true;
      this.retryAttempts = 0;
      
      logger.info('✅ Redis connected successfully');
      
      // Test connection
      await this.client.ping();
      logger.info('🏓 Redis ping successful');
      
    } catch (error) {
      this.isConnected = false;
      this.retryAttempts++;
      logger.error('❌ Redis connection error:', error.message);
      
      if (this.retryAttempts < this.maxRetries) {
        logger.info(`🔄 Retrying Redis connection in ${this.retryDelay}ms...`);
        setTimeout(() => this.connect(), this.retryDelay);
      } else {
        logger.error('❌ Redis connection failed permanently');
        throw error;
      }
    }
  }

  /**
   * Set up Redis client event listeners
   * 
   * Handles connection events, errors, and monitoring.
   */
  setupEventListeners() {
    this.client.on('connect', () => {
      logger.info('🔗 Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('⚡ Redis client ready');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      logger.error('❌ Redis client error:', error.message);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      logger.warn('🔌 Redis connection ended');
      this.isConnected = false;
    });

    this.client.on('reconnecting', (delay, attempt) => {
      logger.warn(`🔄 Redis reconnecting in ${delay}ms (attempt ${attempt})`);
    });
  }

  /**
   * Get Redis client instance
   * 
   * @returns {Object} Redis client instance
   */
  getClient() {
    if (!this.client || !this.isConnected) {
      throw new Error('Redis client not connected');
    }
    return this.client;
  }

  /**
   * Check if Redis is connected
   * 
   * @returns {boolean} Connection status
   */
  isReady() {
    return this.isConnected && this.client?.isReady;
  }

  /**
   * Gracefully disconnect from Redis
   */
  async disconnect() {
    if (this.client) {
      try {
        logger.info('🔌 Disconnecting from Redis...');
        await this.client.quit();
        this.isConnected = false;
        logger.info('✅ Redis disconnected successfully');
      } catch (error) {
        logger.error('❌ Error disconnecting from Redis:', error.message);
      }
    }
  }
}

// Create singleton instance
const redisClient = new RedisClient();

/**
 * Cache Helper Functions
 * 
 * Utility functions for common caching operations with error handling.
 */

/**
 * Get value from cache
 * 
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
const get = async (key) => {
  try {
    if (!redisClient.isReady()) {
      logger.warn('⚠️ Redis not ready, skipping cache get');
      return null;
    }
    
    const value = await redisClient.getClient().get(key);
    if (value) {
      logger.debug(`📖 Cache hit: ${key}`);
      return JSON.parse(value);
    }
    
    logger.debug(`📭 Cache miss: ${key}`);
    return null;
  } catch (error) {
    logger.error('❌ Cache get error:', error.message);
    return null;
  }
};

/**
 * Set value in cache with expiration
 * 
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
const set = async (key, value, ttl = 300) => {
  try {
    if (!redisClient.isReady()) {
      logger.warn('⚠️ Redis not ready, skipping cache set');
      return;
    }
    
    await redisClient.getClient().setEx(key, ttl, JSON.stringify(value));
    logger.debug(`💾 Cache set: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    logger.error('❌ Cache set error:', error.message);
  }
};

/**
 * Delete key from cache
 * 
 * @param {string} key - Cache key to delete
 */
const del = async (key) => {
  try {
    if (!redisClient.isReady()) {
      logger.warn('⚠️ Redis not ready, skipping cache delete');
      return;
    }
    
    await redisClient.getClient().del(key);
    logger.debug(`🗑️ Cache deleted: ${key}`);
  } catch (error) {
    logger.error('❌ Cache delete error:', error.message);
  }
};

/**
 * Clear all cache with pattern matching
 * 
 * @param {string} pattern - Pattern to match (e.g., 'blogs:*')
 */
const clearPattern = async (pattern) => {
  try {
    if (!redisClient.isReady()) {
      logger.warn('⚠️ Redis not ready, skipping cache clear');
      return;
    }
    
    const keys = await redisClient.getClient().keys(pattern);
    if (keys.length > 0) {
      await redisClient.getClient().del(keys);
      logger.debug(`🧹 Cache cleared: ${keys.length} keys matching ${pattern}`);
    }
  } catch (error) {
    logger.error('❌ Cache clear error:', error.message);
  }
};

module.exports = {
  redisClient,
  cache: {
    get,
    set,
    del,
    clearPattern
  }
};
