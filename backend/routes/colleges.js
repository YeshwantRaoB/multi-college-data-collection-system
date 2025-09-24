const express = require('express');
const College = require('../models/College');
const UpdateLog = require('../models/UpdateLog');
const { auth, adminAuth, collegeAuth } = require('../middleware/auth');
const router = express.Router();

// Get all colleges (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const colleges = await College.find().sort({ collegeName: 1 });
        res.json(colleges);
    } catch (error) {
        console.error('Get colleges error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get college by code
router.get('/:collegeCode', auth, async (req, res) => {
    try {
        const college = await College.findOne({ collegeCode: req.params.collegeCode });
        
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        // College users can only access their own college data
        if (req.user.role === 'college' && req.user.collegeCode !== college.collegeCode) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(college);
    } catch (error) {
        console.error('Get college error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new college (admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const {
            collegeCode,
            collegeName,
            district,
            taluk,
            designation,
            group,
            branch,
            sanctioned,
            working,
            deputation,
            remarks
        } = req.body;

        // Check if college code already exists
        const existingCollege = await College.findOne({ collegeCode });
        if (existingCollege) {
            return res.status(400).json({ message: 'College code already exists' });
        }

        const college = new College({
            collegeCode,
            collegeName,
            district,
            taluk,
            designation,
            group,
            branch,
            sanctioned,
            working,
            deputation,
            remarks,
            updatedBy: req.user._id
        });

        await college.save();

        // Log the creation
        const updateLog = new UpdateLog({
            user: req.user._id,
            collegeCode: college.collegeCode,
            fieldChanged: 'College Created',
            oldValue: 'N/A',
            newValue: 'New college created',
            ipAddress: req.ip
        });
        await updateLog.save();

        res.status(201).json({ message: 'College created successfully', college });
    } catch (error) {
        console.error('Create college error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update college (admin can update all fields, college users only working and deputation)
router.put('/:collegeCode', auth, async (req, res) => {
    try {
        const college = await College.findOne({ collegeCode: req.params.collegeCode });
        
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        // College users can only update their own college
        if (req.user.role === 'college' && req.user.collegeCode !== college.collegeCode) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updateLogs = [];
        const updatedFields = {};

        // Define allowed fields for college users
        const collegeUserAllowedFields = ['working', 'deputation'];
        
        Object.keys(req.body).forEach(field => {
            // Check if college user is trying to update non-allowed field
            if (req.user.role === 'college' && !collegeUserAllowedFields.includes(field)) {
                return res.status(403).json({ 
                    message: `You can only update ${collegeUserAllowedFields.join(', ')} fields` 
                });
            }

            if (college[field] !== req.body[field]) {
                // Create update log
                updateLogs.push({
                    user: req.user._id,
                    collegeCode: college.collegeCode,
                    fieldChanged: field,
                    oldValue: college[field].toString(),
                    newValue: req.body[field].toString(),
                    ipAddress: req.ip
                });

                updatedFields[field] = req.body[field];
            }
        });

        if (Object.keys(updatedFields).length === 0) {
            return res.status(400).json({ message: 'No changes detected' });
        }

        updatedFields.updatedBy = req.user._id;
        updatedFields.lastUpdated = new Date();

        const updatedCollege = await College.findOneAndUpdate(
            { collegeCode: req.params.collegeCode },
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        // Save all update logs
        for (const logData of updateLogs) {
            const updateLog = new UpdateLog(logData);
            await updateLog.save();
        }

        res.json({ message: 'College updated successfully', college: updatedCollege });
    } catch (error) {
        console.error('Update college error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete college (admin only)
router.delete('/:collegeCode', adminAuth, async (req, res) => {
    try {
        const college = await College.findOne({ collegeCode: req.params.collegeCode });
        
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        await College.deleteOne({ collegeCode: req.params.collegeCode });

        // Log the deletion
        const updateLog = new UpdateLog({
            user: req.user._id,
            collegeCode: college.collegeCode,
            fieldChanged: 'College Deleted',
            oldValue: 'Exists',
            newValue: 'Deleted',
            ipAddress: req.ip
        });
        await updateLog.save();

        res.json({ message: 'College deleted successfully' });
    } catch (error) {
        console.error('Delete college error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get college data for current user (for college users)
router.get('/user/current', collegeAuth, async (req, res) => {
    try {
        const college = await College.findOne({ collegeCode: req.user.collegeCode });
        
        if (!college) {
            return res.status(404).json({ message: 'College data not found' });
        }

        res.json(college);
    } catch (error) {
        console.error('Get current college error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;