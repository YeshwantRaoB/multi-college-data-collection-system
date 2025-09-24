const fs = require('fs');
const path = require('path');

console.log('=== Testing File Paths ===\n');

console.log('Current directory:', __dirname);
console.log('');

// Check if middleware directory exists
const middlewarePath = path.join(__dirname, 'middleware');
console.log('Middleware path exists:', fs.existsSync(middlewarePath));

if (fs.existsSync(middlewarePath)) {
    console.log('Files in middleware directory:');
    fs.readdirSync(middlewarePath).forEach(file => {
        console.log('  -', file);
    });
}
console.log('');

// Check if auth.js exists in middleware
const authMiddlewarePath = path.join(middlewarePath, 'auth.js');
console.log('auth.js exists in middleware:', fs.existsSync(authMiddlewarePath));
console.log('');

// Try to require the middleware
console.log('Trying to require middleware/auth...');
try {
    const middleware = require('./middleware/auth');
    console.log('✅ Successfully loaded middleware/auth');
    console.log('Exports:', Object.keys(middleware));
} catch (error) {
    console.log('❌ Error loading middleware/auth:', error.message);
    console.log('Error details:', error);
}