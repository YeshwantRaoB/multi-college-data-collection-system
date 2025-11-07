/**
 * Simple in-memory caching middleware
 * For production, consider using Redis for distributed caching
 */

const cache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minute default

/**
 * Create a caching middleware
 * @param {number} duration - Cache duration in milliseconds
 * @param {function} keyGenerator - Optional custom key generator function
 */
const createCache = (duration = CACHE_DURATION, keyGenerator = null) => {
    return (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key
        const key = keyGenerator 
            ? keyGenerator(req) 
            : `${req.originalUrl || req.url}_${req.user?._id || 'anonymous'}`;

        // Check if cached response exists and is still valid
        const cached = cache.get(key);
        if (cached && Date.now() - cached.timestamp < duration) {
            console.log(`📦 Cache HIT: ${key}`);
            return res.json(cached.data);
        }

        console.log(`🔍 Cache MISS: ${key}`);

        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to cache response
        res.json = function(data) {
            // Cache the response
            cache.set(key, {
                data: data,
                timestamp: Date.now()
            });

            // Call original json method
            return originalJson(data);
        };

        next();
    };
};

/**
 * Clear cache entries matching a pattern
 * @param {string|RegExp} pattern - Pattern to match cache keys
 */
const clearCache = (pattern = null) => {
    if (!pattern) {
        cache.clear();
        console.log('🗑️  Cleared all cache');
        return;
    }

    const keysToDelete = [];
    for (const key of cache.keys()) {
        if (pattern instanceof RegExp) {
            if (pattern.test(key)) {
                keysToDelete.push(key);
            }
        } else if (typeof pattern === 'string') {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        }
    }

    keysToDelete.forEach(key => cache.delete(key));
    console.log(`🗑️  Cleared ${keysToDelete.length} cache entries matching pattern:`, pattern);
};

/**
 * Middleware to clear cache on mutations
 */
const clearCacheOnMutation = (patterns) => {
    return (req, res, next) => {
        // Store original json and status methods
        const originalJson = res.json.bind(res);
        const originalStatus = res.status.bind(res);

        let statusCode = 200;

        // Override status to track status code
        res.status = function(code) {
            statusCode = code;
            return originalStatus(code);
        };

        // Override json to clear cache on successful mutations
        res.json = function(data) {
            // Only clear cache if mutation was successful (2xx status)
            if (statusCode >= 200 && statusCode < 300) {
                if (Array.isArray(patterns)) {
                    patterns.forEach(pattern => clearCache(pattern));
                } else {
                    clearCache(patterns);
                }
            }
            return originalJson(data);
        };

        next();
    };
};

/**
 * Periodic cache cleanup to prevent memory leaks
 */
const startCacheCleanup = (interval = 5 * 60 * 1000) => {
    setInterval(() => {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, value] of cache.entries()) {
            // Remove entries older than 10 minutes
            if (now - value.timestamp > 10 * 60 * 1000) {
                cache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} stale cache entries. Cache size: ${cache.size}`);
        }
    }, interval);
};

// Start cleanup on module load
startCacheCleanup();

module.exports = {
    createCache,
    clearCache,
    clearCacheOnMutation,
    cache
};
