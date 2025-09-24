const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with connection pooling
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ 
      status: 'OK', 
      message: 'College Data System API is running',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      message: 'Database connection failed',
      error: error.message 
    });
  }
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
  res.status(500).json({ message: 'Something went wrong!' });
});

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Connect to database on each request (Vercel serverless)
  try {
    await connectDB();
  } catch (error) {
    return res.status(500).json({ message: 'Database connection failed' });
  }

  // Execute the Express app
  return app(req, res);
};