/**
 * Performance monitoring middleware
 * Tracks query execution time and logs slow queries
 */

const SLOW_QUERY_THRESHOLD = 1000; // 1 second

/**
 * Middleware to track API request performance
 */
const requestPerformanceMonitor = (req, res, next) => {
    const startTime = Date.now();
    const originalJson = res.json;
    
    // Override res.json to capture response time
    res.json = function(data) {
        const duration = Date.now() - startTime;
        
        // Log slow requests
        if (duration > SLOW_QUERY_THRESHOLD) {
            console.warn(`⚠️  SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
        }
        
        // Add performance header
        res.set('X-Response-Time', `${duration}ms`);
        
        // Log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.log(`${req.method} ${req.path} - ${duration}ms`);
        }
        
        return originalJson.call(this, data);
    };
    
    next();
};

/**
 * Setup mongoose query monitoring
 * Logs slow database queries
 */
const setupDatabaseMonitoring = (mongoose) => {
    if (process.env.NODE_ENV !== 'production') {
        // Enable mongoose debug mode in development
        mongoose.set('debug', true);
    }
    
    // Monitor slow queries
    mongoose.plugin((schema) => {
        schema.pre('find', function() {
            this._startTime = Date.now();
        });
        
        schema.pre('findOne', function() {
            this._startTime = Date.now();
        });
        
        schema.pre('findOneAndUpdate', function() {
            this._startTime = Date.now();
        });
        
        schema.post('find', function(docs) {
            if (this._startTime) {
                const duration = Date.now() - this._startTime;
                if (duration > SLOW_QUERY_THRESHOLD) {
                    console.warn(`⚠️  SLOW QUERY (find): ${this.model.modelName} took ${duration}ms`);
                    console.warn('Query:', this.getQuery());
                }
            }
        });
        
        schema.post('findOne', function(doc) {
            if (this._startTime) {
                const duration = Date.now() - this._startTime;
                if (duration > SLOW_QUERY_THRESHOLD) {
                    console.warn(`⚠️  SLOW QUERY (findOne): ${this.model.modelName} took ${duration}ms`);
                    console.warn('Query:', this.getQuery());
                }
            }
        });
        
        schema.post('findOneAndUpdate', function(doc) {
            if (this._startTime) {
                const duration = Date.now() - this._startTime;
                if (duration > SLOW_QUERY_THRESHOLD) {
                    console.warn(`⚠️  SLOW QUERY (findOneAndUpdate): ${this.model.modelName} took ${duration}ms`);
                    console.warn('Query:', this.getQuery());
                }
            }
        });
    });
};

/**
 * Get performance stats
 */
const getPerformanceStats = () => {
    return {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        cpu: process.cpuUsage(),
        timestamp: new Date().toISOString()
    };
};

module.exports = {
    requestPerformanceMonitor,
    setupDatabaseMonitoring,
    getPerformanceStats,
    SLOW_QUERY_THRESHOLD
};
