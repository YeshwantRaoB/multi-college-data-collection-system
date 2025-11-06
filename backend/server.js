const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Auth routes have stricter rate limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 auth requests per windowMs (increased for development/testing)
    message: 'Too many authentication attempts, please try again later.',
    skip: (req) => req.method === 'OPTIONS' // Skip rate limiting for CORS preflight requests
});
app.use('/api/auth/login', authLimiter);

// CORS configuration for React frontend
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from React dev server and production domains
        const allowedOrigins = [
            'http://localhost:3000',     // React dev server (CRA default)
            'http://localhost:5173',     // Vite dev server
            'http://127.0.0.1:3000',    // Alternative localhost
            'http://127.0.0.1:5173',    // Alternative localhost for Vite
        ];

        // Add production frontend URL from environment
        if (process.env.FRONTEND_URL) {
            allowedOrigins.push(process.env.FRONTEND_URL);
        }

        // Allow all Vercel preview deployments
        if (origin && (origin.endsWith('.vercel.app') || origin.endsWith('.vercel.app/'))) {
            return callback(null, true);
        }

        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('CORS blocked origin:', origin);
            callback(null, true); // Allow all origins in production for now
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Test route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'College Data System API is running',
        timestamp: new Date().toISOString()
    });
});

// Import routes
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/colleges');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const reportRoutes = require('./routes/reports');
const logRoutes = require('./routes/logs');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/logs', logRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large' });
        }
    }
    res.status(500).json({ message: 'Something went wrong!' });
});

// API 404 handler - no frontend serving, frontend is deployed separately
app.use('/api', (req, res) => {
    res.status(404).json({
        message: `API route not found: ${req.path}`,
        availableRoutes: [
            'GET /api/health',
            'POST /api/auth/login',
            'GET /api/auth/verify',
            'POST /api/auth/change-password',
            'GET /api/colleges',
            'POST /api/colleges',
            'PUT /api/colleges/:id',
            'DELETE /api/colleges/:id',
            'GET /api/colleges/user/current',
            'GET /api/users',
            'POST /api/users',
            'PUT /api/users/:id',
            'DELETE /api/users/:id',
            'POST /api/upload/colleges',
            'POST /api/upload/users',
            'GET /api/upload/template/colleges',
            'GET /api/upload/template/users',
            'GET /api/reports/filters',
            'GET /api/reports/data',
            'GET /api/reports/export/excel',
            'GET /api/reports/export/pdf',
            'GET /api/logs',
            'GET /api/logs/recent/activity'
        ]
    });
});

// Health check for non-API routes
app.get('/', (req, res) => {
    res.json({
        status: 'Backend API Server Running',
        message: 'Multi-College Data Collection System API',
        version: '1.0.0',
        frontend: process.env.FRONTEND_URL || 'Not configured',
        documentation: '/api'
    });
});

// For Vercel deployment
if (process.env.VERCEL) {
    module.exports = app;
} else {
    // For local development
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Backend server is running on port ${PORT}`);
        console.log(`API Base URL: http://localhost:${PORT}/api`);
        console.log(`React Frontend: http://localhost:3000`);
        console.log(`Health Check: http://localhost:${PORT}/api/health`);
    });
}