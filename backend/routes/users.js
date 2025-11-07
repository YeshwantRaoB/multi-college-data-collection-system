const express = require('express');
const User = require('../models/User');
const College = require('../models/College');
const { adminAuth } = require('../middleware/auth');
const { createCache, clearCacheOnMutation } = require('../middleware/cache');
const router = express.Router();

// Get all users (admin only)
router.get('/', adminAuth, createCache(30000), async (req, res) => {
    try {
        const users = await User.find().select('-password').populate('collegeCode', 'collegeName');
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new user (admin only)
router.post('/', adminAuth, clearCacheOnMutation('/users'), async (req, res) => {
    try {
        const { username, password, collegeCode } = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Check if college exists (for college users)
        if (collegeCode) {
            const college = await College.findOne({ collegeCode });
            if (!college) {
                return res.status(400).json({ message: 'College code not found' });
            }
        }

        const user = new User({
            username,
            password,
            collegeCode: collegeCode || null,
            role: collegeCode ? 'college' : 'admin'
        });

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ message: 'User created successfully', user: userResponse });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user (admin only)
router.put('/:userId', adminAuth, clearCacheOnMutation('/users'), async (req, res) => {
    try {
        const { username, collegeCode, isActive } = req.body;

        const updateData = {};
        if (username) updateData.username = username;
        if (collegeCode !== undefined) {
            if (collegeCode) {
                const college = await College.findOne({ collegeCode });
                if (!college) {
                    return res.status(400).json({ message: 'College code not found' });
                }
                updateData.collegeCode = collegeCode;
                updateData.role = 'college';
            } else {
                updateData.collegeCode = null;
                updateData.role = 'admin';
            }
        }
        if (isActive !== undefined) updateData.isActive = isActive;

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user (admin only)
router.delete('/:userId', adminAuth, clearCacheOnMutation('/users'), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await User.deleteOne({ _id: req.params.userId });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;