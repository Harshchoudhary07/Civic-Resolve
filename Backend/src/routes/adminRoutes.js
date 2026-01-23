const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { protect, admin } = require('../middlewares/authMiddleware');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Get dashboard summary
// @route   GET /api/admin/summary
// @access  Private/Admin
const getSummary = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments({});
    const totalComplaints = await Complaint.countDocuments({});
    const pendingApprovals = await User.countDocuments({ role: 'pending_official' });
    const totalOfficials = await User.countDocuments({ role: 'official', isActive: true });
    res.json({ totalUsers, totalComplaints, pendingApprovals, totalOfficials });
});

// @desc    Approve a pending official
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user && user.role === 'pending_official') {
    user.role = 'official';
    user.isActive = true;
    await user.save();
    res.json({ message: 'User approved' });
  } else {
    res.status(404);
    throw new Error('User not found or cannot be approved');
  }
});

// @desc    Deactivate a user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot deactivate an admin');
    }
    user.isActive = false;
    await user.save();
    res.json({ message: 'User deactivated' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Activate a user
// @route   PUT /api/admin/users/:id/activate
// @access  Private/Admin
const activateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin') {
      res.status(400);
      throw new Error('Cannot change admin status');
    }
    user.isActive = true;
    await user.save();
    res.json({ message: 'User activated successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

router.route('/users').get(protect, admin, getUsers);
router.route('/summary').get(protect, admin, getSummary);
router.route('/users/:id/approve').put(protect, admin, approveUser);
router.route('/users/:id/deactivate').put(protect, admin, deactivateUser);
router.route('/users/:id/activate').put(protect, admin, activateUser);

module.exports = router;