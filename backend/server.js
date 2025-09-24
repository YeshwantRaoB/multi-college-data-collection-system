const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

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

// Catch-all handler: must be after all API routes
app.use((req, res) => {
    // If the request is for an API route that doesn't exist
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ 
            message: `API route not found: ${req.path}` 
        });
    }
    
    // For all other routes, serve the frontend
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api/health`);
    console.log(`📊 Admin Login: http://localhost:${PORT}`);
});