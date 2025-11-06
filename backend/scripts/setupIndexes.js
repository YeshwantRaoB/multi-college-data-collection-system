const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const setupDatabaseIndexes = async () => {
    try {
        console.log('🚀 Starting database index setup...\n');
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB\n');

        // Get database
        const db = mongoose.connection.db;

        // ===== USERS COLLECTION =====
        console.log('📋 Setting up indexes for USERS collection...');
        const usersCollection = db.collection('users');
        
        // Username index (unique, for login)
        await usersCollection.createIndex({ username: 1 }, { unique: true });
        console.log('  ✅ Username index (unique)');
        
        // Role index (for filtering)
        await usersCollection.createIndex({ role: 1 });
        console.log('  ✅ Role index');
        
        // College code index (for college users)
        await usersCollection.createIndex({ collegeCode: 1 });
        console.log('  ✅ College code index');
        
        // Compound index for active users by role
        await usersCollection.createIndex({ isActive: 1, role: 1 });
        console.log('  ✅ Active users by role index\n');

        // ===== COLLEGES COLLECTION =====
        console.log('📋 Setting up indexes for COLLEGES collection...');
        const collegesCollection = db.collection('colleges');
        
        // College code index (unique, primary identifier)
        await collegesCollection.createIndex({ collegeCode: 1 }, { unique: true });
        console.log('  ✅ College code index (unique)');
        
        // District index (for filtering)
        await collegesCollection.createIndex({ district: 1 });
        console.log('  ✅ District index');
        
        // Taluk index (for filtering)
        await collegesCollection.createIndex({ taluk: 1 });
        console.log('  ✅ Taluk index');
        
        // Designation index (for filtering)
        await collegesCollection.createIndex({ designation: 1 });
        console.log('  ✅ Designation index');
        
        // Group index (for filtering)
        await collegesCollection.createIndex({ group: 1 });
        console.log('  ✅ Group index');
        
        // Branch index (for filtering)
        await collegesCollection.createIndex({ branch: 1 });
        console.log('  ✅ Branch index');
        
        // College name index (for searching)
        await collegesCollection.createIndex({ collegeName: 1 });
        console.log('  ✅ College name index');
        
        // Text index for full-text search
        await collegesCollection.createIndex({
            collegeName: 'text',
            collegeCode: 'text',
            district: 'text',
            remarks: 'text'
        });
        console.log('  ✅ Text search index');
        
        // Compound index for common queries
        await collegesCollection.createIndex({ district: 1, taluk: 1, designation: 1 });
        console.log('  ✅ District-Taluk-Designation compound index');
        
        // Last updated index (for recent changes)
        await collegesCollection.createIndex({ lastUpdated: -1 });
        console.log('  ✅ Last updated index\n');

        // ===== UPDATE LOGS COLLECTION =====
        console.log('📋 Setting up indexes for UPDATE LOGS collection...');
        const logsCollection = db.collection('updatelogs');
        
        // College code index (for filtering logs by college)
        await logsCollection.createIndex({ collegeCode: 1 });
        console.log('  ✅ College code index');
        
        // User index (for filtering logs by user)
        await logsCollection.createIndex({ user: 1 });
        console.log('  ✅ User index');
        
        // Created at index (for sorting by date, descending)
        await logsCollection.createIndex({ createdAt: -1 });
        console.log('  ✅ Created at index (descending)');
        
        // Compound index for college logs sorted by date
        await logsCollection.createIndex({ collegeCode: 1, createdAt: -1 });
        console.log('  ✅ College code + date compound index');
        
        // Compound index for user logs sorted by date
        await logsCollection.createIndex({ user: 1, createdAt: -1 });
        console.log('  ✅ User + date compound index\n');

        // ===== VERIFY INDEXES =====
        console.log('🔍 Verifying indexes...\n');
        
        const usersIndexes = await usersCollection.indexes();
        console.log('Users collection indexes:', usersIndexes.length);
        
        const collegesIndexes = await collegesCollection.indexes();
        console.log('Colleges collection indexes:', collegesIndexes.length);
        
        const logsIndexes = await logsCollection.indexes();
        console.log('Update logs collection indexes:', logsIndexes.length);

        console.log('\n✨ All indexes created successfully!');
        console.log('📈 Database is now optimized for better performance.\n');
        
        // Show index details
        console.log('📊 Index Summary:');
        console.log(`   Users:        ${usersIndexes.length} indexes`);
        console.log(`   Colleges:     ${collegesIndexes.length} indexes`);
        console.log(`   Update Logs:  ${logsIndexes.length} indexes`);
        console.log(`   Total:        ${usersIndexes.length + collegesIndexes.length + logsIndexes.length} indexes\n`);

    } catch (error) {
        console.error('❌ Error setting up indexes:', error.message);
        console.error('Full error:', error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed');
        }
        process.exit(0);
    }
};

console.log('═══════════════════════════════════════════════════════════');
console.log('  DATABASE INDEX SETUP');
console.log('  Multi-College Data Collection System');
console.log('═══════════════════════════════════════════════════════════\n');

setupDatabaseIndexes();
