const mongoose = require('mongoose');
const College = require('../models/College');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sampleColleges = [
    {
        collegeCode: 'COL001',
        collegeName: 'Government College of Engineering',
        district: 'Bangalore',
        taluk: 'Bangalore South',
        designation: 'Engineering',
        group: 'Technical',
        branch: 'Computer Science',
        sanctioned: 50,
        working: 45,
        vacant: 5,
        deputation: 2,
        remarks: 'Fully staffed'
    },
    {
        collegeCode: 'COL002',
        collegeName: 'Government Arts College',
        district: 'Mysore',
        taluk: 'Mysore North',
        designation: 'Arts',
        group: 'Humanities',
        branch: 'History',
        sanctioned: 30,
        working: 25,
        vacant: 5,
        deputation: 1,
        remarks: 'Need more faculty'
    }
];

const sampleUsers = [
    {
        username: 'college1',
        password: 'college123',
        collegeCode: 'COL001',
        role: 'college'
    },
    {
        username: 'college2',
        password: 'college123',
        collegeCode: 'COL002',
        role: 'college'
    }
];

const createSampleData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create sample colleges
        for (const collegeData of sampleColleges) {
            const existingCollege = await College.findOne({ collegeCode: collegeData.collegeCode });
            if (!existingCollege) {
                const college = new College(collegeData);
                await college.save();
                console.log(`Created college: ${college.collegeName}`);
            }
        }

        // Create sample users
        for (const userData of sampleUsers) {
            const existingUser = await User.findOne({ username: userData.username });
            if (!existingUser) {
                const user = new User(userData);
                await user.save();
                console.log(`Created user: ${user.username}`);
            }
        }

        console.log('Sample data created successfully!');
        console.log('College user credentials:');
        console.log('College 1: college1 / college123');
        console.log('College 2: college2 / college123');

    } catch (error) {
        console.error('Error creating sample data:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createSampleData();