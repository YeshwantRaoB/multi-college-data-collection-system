const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 * Optimized for Vercel serverless deployment with proper error handling
 */

// Connection options optimized for serverless and production
const mongooseOptions = {
    // Connection timeout - increased for serverless cold starts
    serverSelectionTimeoutMS: 30000, // 30 seconds (increased from default 10s)
    socketTimeoutMS: 45000,           // 45 seconds
    connectTimeoutMS: 30000,          // 30 seconds
    
    // Connection pool settings - optimized for serverless
    maxPoolSize: 10,                  // Maximum connections in pool
    minPoolSize: 2,                   // Minimum connections to maintain
    maxIdleTimeMS: 10000,            // Close idle connections after 10s
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Performance settings
    maxConnecting: 2,                 // Max simultaneous connections being established
    
    // Heartbeat and monitoring
    heartbeatFrequencyMS: 10000,     // Check connection health every 10s
};

// Cache the connection for serverless reuse (Vercel optimization)
let cachedConnection = null;

/**
 * Connect to MongoDB with proper error handling and retry logic
 */
const connectDB = async () => {
    // Return cached connection if available (serverless optimization)
    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log('📦 Using cached MongoDB connection');
        return cachedConnection;
    }

    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            throw new Error('❌ MONGODB_URI is not defined in environment variables');
        }

        console.log('🔄 Connecting to MongoDB Atlas...');
        const startTime = Date.now();

        // Connect with options (no deprecated useNewUrlParser/useUnifiedTopology)
        const connection = await mongoose.connect(MONGODB_URI, mongooseOptions);
        
        const duration = Date.now() - startTime;
        console.log(`✅ MongoDB Connected successfully in ${duration}ms`);
        console.log(`📊 Database: ${connection.connection.name}`);
        console.log(`🌐 Host: ${connection.connection.host}`);
        
        // Cache the connection for serverless reuse
        cachedConnection = connection;
        
        return connection;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        
        // Provide helpful error messages
        if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error('💡 Fix: Check your MongoDB URI - domain name cannot be resolved');
        } else if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
            console.error('💡 Fix: Check your MongoDB username and password');
        } else if (error.message.includes('timed out')) {
            console.error('💡 Fix: Check MongoDB Atlas Network Access');
            console.error('   1. Go to https://cloud.mongodb.com');
            console.error('   2. Network Access → Add IP Address');
            console.error('   3. Add 0.0.0.0/0 to allow all IPs (required for Vercel)');
        }
        
        // Don't throw in production - allow app to continue
        // Login will fail but server stays up for health checks
        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
            console.error('⚠️  Server running without database connection');
        } else {
            throw error;
        }
    }
};

/**
 * Setup MongoDB connection event listeners
 */
const setupConnectionListeners = () => {
    // Connection opened
    mongoose.connection.on('connected', () => {
        console.log('✅ Mongoose connected to MongoDB');
    });

    // Connection error
    mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err.message);
    });

    // Connection disconnected
    mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  Mongoose disconnected from MongoDB');
        // Clear cache so next request reconnects
        cachedConnection = null;
    });

    // App termination - close connection gracefully
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('👋 Mongoose connection closed through app termination');
        process.exit(0);
    });

    // Vercel serverless cleanup
    if (process.env.VERCEL) {
        process.on('SIGTERM', async () => {
            await mongoose.connection.close();
            console.log('👋 Mongoose connection closed (SIGTERM)');
        });
    }
};

/**
 * Get current connection status
 */
const getConnectionStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    const readyState = mongoose.connection.readyState;
    
    return {
        state: states[readyState] || 'unknown',
        readyState: readyState,
        isConnected: readyState === 1,
        host: mongoose.connection.host || 'N/A',
        name: mongoose.connection.name || 'N/A',
        collections: Object.keys(mongoose.connection.collections).length
    };
};

/**
 * Health check for database connection
 */
const checkDatabaseHealth = async () => {
    try {
        const status = getConnectionStatus();
        
        if (!status.isConnected) {
            return {
                status: 'unhealthy',
                message: 'Database not connected',
                details: status
            };
        }

        // Ping database to verify it's responding
        await mongoose.connection.db.admin().ping();
        
        return {
            status: 'healthy',
            message: 'Database is connected and responding',
            details: status,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            message: 'Database connection error',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

module.exports = {
    connectDB,
    setupConnectionListeners,
    getConnectionStatus,
    checkDatabaseHealth
};
