const express = require('express');
const College = require('../models/College');
const UpdateLog = require('../models/UpdateLog');
const { auth, adminAuth, collegeAuth } = require('../middleware/auth');
const { validateBody, schemas } = require('../middleware/validate');
const { createCache, clearCacheOnMutation } = require('../middleware/cache');
const router = express.Router();

// Get all colleges (admin only) with pagination
router.get('/', adminAuth, createCache(30000), async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
        const skip = (page - 1) * limit;

        const [colleges, total] = await Promise.all([
            College.find().sort({ collegeName: 1 }).skip(skip).limit(limit).lean(),
            College.countDocuments()
        ]);

        res.json({
            data: colleges,
            meta: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get colleges error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get college by code
router.get('/:collegeCode', auth, createCache(30000), async (req, res) => {
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

// Create new college (admin only) — apply validation
router.post('/', adminAuth, clearCacheOnMutation('/colleges'), validateBody(schemas.collegeCreate), async (req, res) => {
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
            deputationToCollegeCode,
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
            deputationToCollegeCode,
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
// apply validation (partial) for update
router.put('/:collegeCode', auth, clearCacheOnMutation('/colleges'), validateBody(schemas.collegeUpdate), async (req, res) => {
    try {
        const college = await College.findOne({ collegeCode: req.params.collegeCode });
        
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }

        // College users can only update their own college
        if (req.user.role === 'college' && req.user.collegeCode !== college.collegeCode) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Define allowed fields for college users
        const collegeUserAllowedFields = ['working', 'deputation', 'vacant', 'deputationToCollegeCode'];

        // Build newValues with validation
        const incoming = req.body || {};
        const newValues = {};

        // Validate each incoming field
        for (const field of Object.keys(incoming)) {
            if (req.user.role === 'college' && !collegeUserAllowedFields.includes(field)) {
                return res.status(403).json({ 
                    message: `You can only update ${collegeUserAllowedFields.join(', ')} fields` 
                });
            }

            // sanitize numeric fields
            if (['sanctioned', 'working', 'deputation', 'vacant'].includes(field)) {
                const n = parseInt(incoming[field], 10);
                if (Number.isNaN(n) || n < 0) {
                    return res.status(400).json({ message: `Invalid value for ${field}` });
                }
                newValues[field] = n;
            } else {
                newValues[field] = incoming[field];
            }
        }

        // If no changes requested
        if (Object.keys(newValues).length === 0) {
            return res.status(400).json({ message: 'No changes detected' });
        }

        // Compute resulting numeric values (use existing values when not updated)
        const resultingSanctioned = ('sanctioned' in newValues) ? newValues.sanctioned : college.sanctioned;
        let resultingWorking = ('working' in newValues) ? newValues.working : college.working;
        const resultingDeputation = ('deputation' in newValues) ? newValues.deputation : college.deputation;
        let resultingVacant = ('vacant' in newValues) ? newValues.vacant : null;

        // If vacant is provided, adjust working to maintain the equation
        // Vacant = Sanctioned - Working - Deputation
        // Therefore: Working = Sanctioned - Vacant - Deputation
        if (resultingVacant !== null) {
            resultingWorking = Math.max(0, resultingSanctioned - resultingVacant - resultingDeputation);
            newValues.working = resultingWorking;
        }
        
        // Recompute vacant server-side (always recalculate to ensure consistency)
        const computedVacant = Math.max(0, resultingSanctioned - resultingWorking - resultingDeputation);
        newValues.vacant = computedVacant;

        // Prepare update logs: only for fields that actually change
        const updateLogs = [];
        for (const [field, value] of Object.entries(newValues)) {
            const oldValRaw = college[field] === undefined || college[field] === null ? '' : college[field];
            const newValRaw = value === undefined || value === null ? '' : value;

            // Compare as strings to cover numbers and strings
            if (String(oldValRaw) !== String(newValRaw)) {
                updateLogs.push({
                    user: req.user._id,
                    collegeCode: college.collegeCode,
                    fieldChanged: field,
                    oldValue: String(oldValRaw),
                    newValue: String(newValRaw),
                    ipAddress: req.ip
                });
            }
        }

        // Attach metadata
        newValues.updatedBy = req.user._id;
        newValues.lastUpdated = new Date();

        // Apply update (findOneAndUpdate bypasses pre save hooks, so vacant already set)
        const updatedCollege = await College.findOneAndUpdate(
            { collegeCode: req.params.collegeCode },
            { $set: newValues },
            { new: true, runValidators: true }
        );

        // Persist logs
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
router.delete('/:collegeCode', adminAuth, clearCacheOnMutation('/colleges'), async (req, res) => {
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
router.get('/user/current', collegeAuth, createCache(30000), async (req, res) => {
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