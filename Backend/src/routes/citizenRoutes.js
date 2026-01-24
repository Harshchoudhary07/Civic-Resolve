const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getDashboardSummary,
  getRecentComplaints,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getBasicProfile,
  getComplaintById,
} = require('../controllers/citizenController');

// All routes in this file are protected and for the 'citizen' role
router.use(protect, authorize('citizen'));

router.get('/dashboard', getDashboardSummary);
router.get('/complaints/recent', getRecentComplaints);
router.get('/complaints/:id', getComplaintById);
router.get('/profile/basic', getBasicProfile);

router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationAsRead);
router.patch('/notifications/mark-all-read', markAllNotificationsAsRead);

module.exports = router;