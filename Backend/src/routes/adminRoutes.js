const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getUsers,
  approveUser,
  banUser,
  activateUser,
  assignDepartment,
  getComplaints,
  archiveComplaint,
  overrideStatus,
  getAnalytics,
  createDepartment,
  getDepartments
} = require('../controllers/adminController');

// Global middleware: All routes require Auth + Admin Role
router.use(protect);
router.use(authorize('admin'));

// User Management
router.get('/users', getUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/ban', banUser);
router.put('/users/:id/activate', activateUser);
router.put('/users/:id/assign-department', assignDepartment);

// Complaint Oversight
router.get('/complaints', getComplaints);
router.put('/complaints/:id/archive', archiveComplaint);
router.put('/complaints/:id/override-status', overrideStatus);

// Analytics & Config
router.get('/analytics', getAnalytics);
router.route('/departments')
  .get(getDepartments)
  .post(createDepartment);

module.exports = router;