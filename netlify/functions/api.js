const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Initialize DB connection
let dbConnected = false;
connectDB().then(() => {
  dbConnected = true;
  console.log('Database connection established');
}).catch(console.error);

// Import your routes
const authRoutes = require('../../backend/routes/auth');
const collegeRoutes = require('../../backend/routes/colleges');
const userRoutes = require('../../backend/routes/users');

// Use your existing routes
app.use('/auth', authRoutes);
app.use('/colleges', collegeRoutes);
app.use('/users', userRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  res.json({
    status: 'OK',
    database: dbConnected ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Netlify function handler
const handler = async (event, context) => {
  // Check database connection for each request
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Database connection failed' })
      };
    }
  }

  // Convert Netlify event to Express request
  const request = {
    method: event.httpMethod,
    path: event.path.replace('/.netlify/functions/api', ''),
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : {},
    query: event.queryStringParameters || {}
  };

  // Mock response object
  const response = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader: function(key, value) {
      this.headers[key] = value;
    },
    json: function(data) {
      this.body = JSON.stringify(data);
      this.setHeader('Content-Type', 'application/json');
    },
    status: function(code) {
      this.statusCode = code;
      return this;
    }
  };

  // Handle the request
  try {
    await new Promise((resolve, reject) => {
      // Mock Express request handling
      const mockReq = {
        method: request.method,
        path: request.path,
        headers: request.headers,
        body: request.body,
        query: request.query
      };

      const mockRes = {
        statusCode: 200,
        headers: {},
        setHeader: (key, value) => {
          mockRes.headers[key] = value;
        },
        json: (data) => {
          mockRes.body = JSON.stringify(data);
          resolve();
        },
        status: (code) => {
          mockRes.statusCode = code;
          return mockRes;
        }
      };

      // Find matching route and execute
      const routePath = request.path;
      const method = request.method.toLowerCase();
      
      // Simple route matching (you might need to enhance this)
      if (routePath === '/health' && method === 'get') {
        mockRes.json({
          status: 'OK',
          database: dbConnected ? 'Connected' : 'Disconnected'
        });
      } else if (routePath === '/auth/login' && method === 'post') {
        // Handle login
        authRoutes.handleLogin(mockReq, mockRes);
      } else {
        mockRes.status(404).json({ message: 'Route not found' });
      }
    });

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: error.message })
    };
  }
};

module.exports.handler = handler;