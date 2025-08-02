const { redisClient } = require('../utils/redis');
const logger = require('../utils/logger');

/**
 * Health check controller with Redis status
 */

/**
 * Basic health check endpoint
 */
const healthCheck = async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'healthy',
        redis: 'unknown'
      }
    };

    // Check Redis connection
    try {
      if (redisClient.isReady()) {
        // Try a simple ping operation
        const client = redisClient.getClient();
        if (client) {
          await client.ping();
          health.services.redis = 'healthy';
        } else {
          health.services.redis = 'disconnected';
        }
      } else {
        health.services.redis = 'disconnected';
        // Don't mark as degraded - app can work without Redis
      }
    } catch (error) {
      logger.error('Redis health check failed:', error.message);
      health.services.redis = 'unhealthy';
      // Don't mark as degraded - app can work without Redis
    }

    // Always return 200 - app works without Redis
    res.status(200).json(health);
  } catch (error) {
    logger.error('Health check error:', error.message);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
};

/**
 * Detailed health check with circuit breaker status
 */
const detailedHealthCheck = async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      services: {
        api: {
          status: 'healthy',
          version: process.env.npm_package_version || '1.0.0'
        },
        redis: {
          status: 'unknown',
          connected: false,
          circuitBreaker: {
            isOpen: false,
            failures: 0,
            lastFailure: null
          }
        }
      }
    };

    // Detailed Redis health check
    try {
      health.services.redis.connected = redisClient.isReady();
      health.services.redis.circuitBreaker.isOpen = redisClient.isCircuitBreakerOpen;
      health.services.redis.circuitBreaker.failures = redisClient.circuitBreakerFailures;
      health.services.redis.circuitBreaker.lastFailure = redisClient.circuitBreakerLastFailure;

      if (redisClient.isReady()) {
        const startTime = Date.now();
        const client = redisClient.getClient();
        if (client) {
          await client.ping();
          const responseTime = Date.now() - startTime;
          
          health.services.redis.status = 'healthy';
          health.services.redis.responseTime = responseTime;
        } else {
          health.services.redis.status = 'disconnected';
        }
      } else if (redisClient.isCircuitBreakerOpen) {
        health.services.redis.status = 'circuit-breaker-open';
        // Don't mark as degraded - app can work without Redis
      } else {
        health.services.redis.status = 'disconnected';
        // Don't mark as degraded - app can work without Redis
      }
    } catch (error) {
      logger.error('Detailed Redis health check failed:', error.message);
      health.services.redis.status = 'unhealthy';
      health.services.redis.error = error.message;
      // Don't mark as degraded - app can work without Redis
    }

    // Always return 200 - app works without Redis
    res.status(200).json(health);
  } catch (error) {
    logger.error('Detailed health check error:', error.message);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed'
    });
  }
};

/**
 * Readiness probe for Kubernetes/Docker
 */
const readinessCheck = async (req, res) => {
  try {
    // App is ready if it can process requests
    // Redis connection is not required for basic functionality
    const ready = {
      ready: true,
      timestamp: new Date().toISOString(),
      services: {
        api: true,
        redis: redisClient.isReady()
      }
    };

    res.status(200).json(ready);
  } catch (error) {
    logger.error('Readiness check error:', error.message);
    res.status(503).json({
      ready: false,
      timestamp: new Date().toISOString(),
      error: 'Readiness check failed'
    });
  }
};

/**
 * Liveness probe for Kubernetes/Docker
 */
const livenessCheck = async (req, res) => {
  try {
    // Simple check that the process is alive
    res.status(200).json({
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    logger.error('Liveness check error:', error.message);
    res.status(500).json({
      alive: false,
      timestamp: new Date().toISOString(),
      error: 'Liveness check failed'
    });
  }
};

module.exports = {
  healthCheck,
  detailedHealthCheck,
  readinessCheck,
  livenessCheck
};
