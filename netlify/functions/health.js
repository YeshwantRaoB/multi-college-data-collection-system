const mongoose = require('mongoose');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'OK',
        database: dbStatus,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        status: 'Error',
        error: error.message 
      })
    };
  }
};