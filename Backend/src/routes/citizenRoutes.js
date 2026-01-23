const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getDashboardSummary,
  getRecentComplaints,
  getNotifications,
  markNotificationAsRead,
  getBasicProfile,
} = require('../controllers/citizenController');

// All routes in this file are protected and for the 'citizen' role
router.use(protect, authorize('citizen'));

router.get('/dashboard', getDashboardSummary);
router.get('/complaints/recent', getRecentComplaints);
router.get('/profile/basic', getBasicProfile);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationAsRead);

module.exports = router;