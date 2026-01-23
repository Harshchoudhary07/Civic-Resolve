const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const summary = await Complaint.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          statuses: { $push: { k: '$_id', v: '$count' } },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: '$statuses' },
        },
      },
    ]);

    const result = {
      open: summary[0]?.Pending || 0,
      inProgress: summary[0]?.['In Progress'] || 0,
      resolved: summary[0]?.Resolved || 0,
    };

    res.status(200).json({ success: true, summary: result });
  } catch (error) {
    next(error);
  }
};

exports.getRecentComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt currentStatus');
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Enforce ownership
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

exports.getBasicProfile = (req, res) => {
  res.status(200).json({
    success: true,
    profile: {
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};