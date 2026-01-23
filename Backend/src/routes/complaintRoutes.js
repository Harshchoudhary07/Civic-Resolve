const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintSummary, // New endpoint for dashboard stats
  getComplaintAnalytics, // New endpoint for analytics page
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // For handling file uploads

router.route('/').post(protect, upload.array('evidence', 5), createComplaint).get(protect, authorize('official', 'admin'), getComplaints);
router.route('/my-complaints').get(protect, authorize('citizen'), getMyComplaints);
router.route('/summary').get(protect, authorize('official', 'admin'), getComplaintSummary); // Route for dashboard summary
router.route('/analytics').get(protect, authorize('official', 'admin'), getComplaintAnalytics); // Route for analytics
router.route('/:id').get(protect, getComplaintById); // Protect this route for all roles
router.route('/:id/status').put(protect, authorize('official', 'admin'), updateComplaintStatus);

module.exports = router;