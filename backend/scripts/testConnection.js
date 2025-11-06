const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const testConnection = async () => {
    try {
        console.log('Testing MongoDB connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI ? 
            process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@') : 
            'NOT SET');

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        console.log('\nConnecting...');
        const startTime = Date.now();
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        });
        
        const duration = Date.now() - startTime;
        console.log(`\n✅ Connected successfully in ${duration}ms`);
        
        // Test a simple query
        console.log('\nTesting database query...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`✅ Found ${collections.length} collections:`, 
            collections.map(c => c.name).join(', '));

        // Test users collection
        console.log('\nTesting users collection...');
        const User = require('../models/User');
        const userCount = await User.countDocuments();
        console.log(`✅ Users collection has ${userCount} users`);

        if (userCount > 0) {
            const adminUser = await User.findOne({ role: 'admin' });
            if (adminUser) {
                console.log(`✅ Admin user found: ${adminUser.username}`);
            } else {
                console.log('⚠️  No admin user found. Run: npm run create-admin');
            }
        } else {
            console.log('⚠️  No users in database. Run: npm run create-admin');
        }

        console.log('\n🎉 All tests passed! Connection is working.');

    } catch (error) {
        console.error('\n❌ Connection failed!');
        console.error('Error:', error.message);
        
        if (error.message.includes('bad auth')) {
            console.error('\n💡 Fix: Check username and password in MongoDB URI');
        } else if (error.message.includes('ENOTFOUND')) {
            console.error('\n💡 Fix: Check cluster URL in MongoDB URI');
        } else if (error.message.includes('timed out')) {
            console.error('\n💡 Fix: Add 0.0.0.0/0 to Network Access in MongoDB Atlas');
            console.error('   Go to: https://cloud.mongodb.com → Network Access → Add IP Address');
        }
        
        process.exit(1);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\nConnection closed.');
        }
        process.exit(0);
    }
};

console.log('═══════════════════════════════════════════════════════════');
console.log('  MONGODB CONNECTION TEST');
console.log('  Multi-College Data Collection System');
console.log('═══════════════════════════════════════════════════════════\n');

testConnection();
