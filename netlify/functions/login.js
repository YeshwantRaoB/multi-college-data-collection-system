const mongoose = require('mongoose');
const User = require('../../backend/models/User');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    await connectDB();

    const { username, password } = JSON.parse(event.body);

    if (!username || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Username and password are required' })
      };
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' })
      };
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          collegeCode: user.collegeCode
        }
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Server error: ' + error.message })
    };
  }
};