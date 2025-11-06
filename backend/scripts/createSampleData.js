const mongoose = require('mongoose');
const College = require('../models/College');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sampleColleges = [
    {
        collegeCode: 'KPTMGL001',
        collegeName: 'Karnataka Government Polytechnic Mangalore',
        district: 'Dakshina Kannada',
        taluk: 'Mangalore',
        designation: 'Principal',
        group: 'Technical Education',
        branch: 'Administration',
        sanctioned: 1,
        working: 1,
        deputation: 0,
        deputationToCollegeCode: '',
        remarks: 'Main campus'
    },
    {
        collegeCode: 'KPTMGL002',
        collegeName: 'Karnataka Government Polytechnic Mangalore',
        district: 'Dakshina Kannada',
        taluk: 'Mangalore',
        designation: 'HOD',
        group: 'Technical Education',
        branch: 'Computer Science',
        sanctioned: 1,
        working: 1,
        deputation: 0,
        deputationToCollegeCode: '',
        remarks: 'CS Department'
    },
    {
        collegeCode: 'KPTMGL003',
        collegeName: 'Karnataka Government Polytechnic Mangalore',
        district: 'Dakshina Kannada',
        taluk: 'Mangalore',
        designation: 'Lecturer',
        group: 'Technical Education',
        branch: 'Computer Science',
        sanctioned: 8,
        working: 6,
        deputation: 1,
        deputationToCollegeCode: 'KPTBLR001',
        remarks: 'Need 2 more lecturers'
    },
    {
        collegeCode: 'KPTBLR001',
        collegeName: 'Government Polytechnic Bangalore',
        district: 'Bangalore Urban',
        taluk: 'Bangalore North',
        designation: 'Principal',
        group: 'Technical Education',
        branch: 'Administration',
        sanctioned: 1,
        working: 1,
        deputation: 0,
        deputationToCollegeCode: '',
        remarks: ''
    },
    {
        collegeCode: 'KPTBLR002',
        collegeName: 'Government Polytechnic Bangalore',
        district: 'Bangalore Urban',
        taluk: 'Bangalore North',
        designation: 'HOD',
        group: 'Technical Education',
        branch: 'Mechanical Engineering',
        sanctioned: 1,
        working: 1,
        deputation: 0,
        deputationToCollegeCode: '',
        remarks: ''
    },
    {
        collegeCode: 'GCEMYS001',
        collegeName: 'Government College of Engineering Mysore',
        district: 'Mysore',
        taluk: 'Mysore South',
        designation: 'Professor',
        group: 'Engineering',
        branch: 'Civil Engineering',
        sanctioned: 5,
        working: 4,
        deputation: 0,
        deputationToCollegeCode: '',
        remarks: '1 position vacant'
    },
    {
        collegeCode: 'GACHAS001',
        collegeName: 'Government Arts College Hassan',
        district: 'Hassan',
        taluk: 'Hassan',
        designation: 'Assistant Professor',
        group: 'Arts',
        branch: 'English',
        sanctioned: 10,
        working: 8,
        deputation: 1,
        deputationToCollegeCode: 'GACMYS001',
        remarks: 'Short staffed'
    },
    {
        collegeCode: 'GACMYS001',
        collegeName: 'Government Arts College Mysore',
        district: 'Mysore',
        taluk: 'Mysore North',
        designation: 'Associate Professor',
        group: 'Arts',
        branch: 'History',
        sanctioned: 6,
        working: 5,
        deputation: 0,
        deputationToCollegeCode: '',
        remarks: ''
    }
];

const sampleUsers = [
    {
        username: 'kptmangalore',
        password: 'college123',
        collegeCode: 'KPTMGL001',
        role: 'college'
    },
    {
        username: 'kptbangalore',
        password: 'college123',
        collegeCode: 'KPTBLR001',
        role: 'college'
    },
    {
        username: 'gcemysore',
        password: 'college123',
        collegeCode: 'GCEMYS001',
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

        console.log('\n✅ Sample data created successfully!');
        console.log('\n📋 Sample College User Credentials:');
        console.log('   KPT Mangalore: kptmangalore / college123');
        console.log('   KPT Bangalore: kptbangalore / college123');
        console.log('   GCE Mysore:    gcemysore / college123');
        console.log('\n💡 Tip: Use these credentials to test college user features\n');

    } catch (error) {
        console.error('Error creating sample data:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createSampleData();