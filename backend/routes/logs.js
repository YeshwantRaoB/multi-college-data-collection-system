const express = require('express');
const UpdateLog = require('../models/UpdateLog');
const College = require('../models/College');
const { adminAuth, auth } = require('../middleware/auth');
const router = express.Router();

// Get all update logs (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50, collegeCode, startDate, endDate } = req.query;
        
        let filter = {};
        
        // Filter by college code
        if (collegeCode) {
            filter.collegeCode = collegeCode;
        }
        
        // Filter by date range
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }
        
        const logs = await UpdateLog.find(filter)
            .populate('user', 'username role')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
        
        const total = await UpdateLog.countDocuments(filter);
        
        res.json({
            logs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get logs for specific college (admin or college user for their college)
router.get('/college/:collegeCode', auth, async (req, res) => {
    try {
        const { collegeCode } = req.params;
        
        // College users can only access logs for their own college
        if (req.user.role === 'college' && req.user.collegeCode !== collegeCode) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        // Verify college exists
        const college = await College.findOne({ collegeCode });
        if (!college) {
            return res.status(404).json({ message: 'College not found' });
        }
        
        const logs = await UpdateLog.find({ collegeCode })
            .populate('user', 'username role')
            .sort({ createdAt: -1 })
            .limit(100);
        
        res.json(logs);
    } catch (error) {
        console.error('Get college logs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent activity for dashboard
router.get('/recent/activity', adminAuth, async (req, res) => {
    try {
        const recentLogs = await UpdateLog.find()
            .populate('user', 'username role')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json(recentLogs);
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;