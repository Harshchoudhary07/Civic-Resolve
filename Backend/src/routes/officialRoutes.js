const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getComplaint,
    updateStatus,
    getAnalytics
} = require('../controllers/officialController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Base Route: /api/official (Assuming mounted in app.js)

// Protect all routes
router.use(protect);
router.use(authorize('official'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/complaints/:id', getComplaint);
router.put('/complaints/:id/status', updateStatus);

// Notification routes for officials
router.get('/notifications', async (req, res, next) => {
    try {
        const Notification = require('../models/Notification');
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json({ success: true, notifications });
    } catch (error) {
        next(error);
    }
});

router.patch('/notifications/:id/read', async (req, res, next) => {
    try {
        const Notification = require('../models/Notification');
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true, notification });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
