const asyncHandler = require('express-async-handler');
const officialService = require('../services/officialService');

// @desc    Get sorted priority dashboard
// @route   GET /api/official/dashboard
// @access  Private (Official)
const getDashboard = asyncHandler(async (req, res) => {
    const data = await officialService.getOfficialDashboard(req.user._id, req.query);
    res.status(200).json({ success: true, count: data.length, data });
});

// @desc    Get complaint details
// @route   GET /api/official/complaints/:id
// @access  Private (Official)
const getComplaint = asyncHandler(async (req, res) => {
    const complaint = await officialService.getComplaintDetails(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: complaint });
});

// @desc    Update status and add remark
// @route   PUT /api/official/complaints/:id/status
// @access  Private (Official)
const updateStatus = asyncHandler(async (req, res) => {
    const { status, remark } = req.body;
    if (!status) {
        res.status(400);
        throw new Error('Status is required');
    }

    const updatedComplaint = await officialService.updateComplaintStatus(
        req.params.id,
        req.user._id,
        status,
        remark
    );

    res.status(200).json({ success: true, data: updatedComplaint });
});

// @desc    Get department analytics
// @route   GET /api/official/analytics
// @access  Private (Official)
const getAnalytics = asyncHandler(async (req, res) => {
    const stats = await officialService.getDepartmentAnalytics(req.user._id);
    res.status(200).json({ success: true, data: stats });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/official/notifications/mark-all-read
// @access  Private (Official)
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const Notification = require('../models/Notification');
    const result = await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
    );
    res.status(200).json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`
    });
});

module.exports = {
    getDashboard,
    getComplaint,
    updateStatus,
    getAnalytics,
    markAllNotificationsAsRead
};
