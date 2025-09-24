const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Fix path to .env

const createAdminUser = async () => {
    try {
        console.log('Starting admin user creation...');
        
        // Check if MONGODB_URI is defined
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        console.log('Connecting to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@')); // Hide password
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            console.log('Username: admin');
            console.log('Role:', existingAdmin.role);
            return;
        }

        // Create admin user
        const adminUser = new User({
            username: 'admin',
            password: 'admin123', // Change this in production!
            role: 'admin'
        });

        await adminUser.save();
        console.log('✅ Admin user created successfully');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Role: admin');
        console.log('⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.log('Current directory:', __dirname);
        console.log('Trying to load .env from:', path.join(__dirname, '../.env'));
        
        // Debug environment variables
        console.log('\nEnvironment variables:');
        console.log('MONGODB_URI:', process.env.MONGODB_URI ? '***' : 'undefined');
        console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***' : 'undefined');
        console.log('PORT:', process.env.PORT);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        }
        process.exit(0);
    }
};

createAdminUser();