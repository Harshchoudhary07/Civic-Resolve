const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Category = require('../models/Category');
const { createNotification } = require('../utils/notificationService');
const cloudinary = require('cloudinary').v2;

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res, next) => {
  try {
    console.log('Received complaint submission request.');
    // 1. Validation
    let { title, description, category, latitude, longitude, manualAddress } = req.body;

    // Basic Sanitization (more robust solutions like 'express-mongo-sanitize' or 'xss' are recommended for production)
    title = title ? title.replace(/</g, "&lt;").replace(/>/g, "&gt;") : title;
    description = description ? description.replace(/</g, "&lt;").replace(/>/g, "&gt;") : description;
    manualAddress = manualAddress ? manualAddress.replace(/</g, "&lt;").replace(/>/g, "&gt;") : manualAddress;

    // Mandatory fields check
    if (!title || title.length < 5 || title.length > 100) {
      console.log('Validation Error: Invalid title.');
      return res.status(400).json({ message: 'Title is required and must be between 5 and 100 characters.' });
    }
    if (!description || description.length < 20) {
      console.log('Validation Error: Invalid description.');
      return res.status(400).json({ message: 'Description is required and must be at least 20 characters.' });
    }
    if (!category) {
      console.log('Validation Error: Category missing.');
      return res.status(400).json({ message: 'Category is required.' });
    }
    console.log('Text fields and category validated.');
    // 2. Location Processing
    let locationData = {};
    if (latitude && longitude) {
      const parsedLatitude = parseFloat(latitude);
      const parsedLongitude = parseFloat(longitude);

      if (isNaN(parsedLatitude) || isNaN(parsedLongitude) || parsedLatitude < -90 || parsedLatitude > 90 || parsedLongitude < -180 || parsedLongitude > 180) {
        console.log('Validation Error: Invalid GPS coordinates.');
        return res.status(400).json({ message: 'Invalid latitude or longitude provided.' });
      }

      // In a real-world app, you would call a reverse geocoding API here.
      // For now, we'll use the provided coordinates for the address string.
      locationData = {
        sourceType: 'GPS',
        address: `Geotagged: Lat ${parsedLatitude.toFixed(5)}, Lon ${parsedLongitude.toFixed(5)}`,
        coordinates: {
          type: 'Point',
          coordinates: [parsedLongitude, parsedLatitude] // [longitude, latitude]
        }
      };
    } else if (manualAddress) {
      locationData = {
        sourceType: 'MANUAL',
        address: manualAddress,
      };
    } else {
      console.log('Validation Error: Location missing.');
      return res.status(400).json({ message: 'Location (GPS or manual address) is required.' });
    }
    console.log('Location data processed:', locationData);

    // 3. Evidence Handling (req.files is from multer upload.array('evidence', 5))
    const attachments = [];
    console.log('Processing evidence. Files received:', req.files ? req.files.length : 0);
    if (req.files && req.files.length > 0) {
      if (req.files.length > 5) {
        return res.status(400).json({ message: 'Maximum 5 evidence files allowed.' });
      }
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        let dataURI = "data:" + file.mimetype + ";base64," + b64;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'civic-resolve-complaints',
          resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
          // You can add more transformations here if needed, e.g., for videos
        });
        console.log(`Uploaded file to Cloudinary: ${result.secure_url}`);
        attachments.push({
          url: result.secure_url,
          mediaType: file.mimetype.startsWith('video') ? 'video' : 'image',
        });
      }
      console.log(`Complaint ${title} submitted with ${attachments.length} attachments.`);
    } else {
      console.log(`Complaint ${title} submitted with NO_EVIDENCE_PROVIDED.`);
    }

    console.log('Attachments processed:', attachments);
    // 4. Complaint Persistence (Atomic Creation)
    const complaint = await Complaint.create({
      title,
      user: req.user.id,
      category: category,
      description,
      location: locationData,
      attachments,
      currentStatus: 'Pending', // Initial status as per requirement
    });
    console.log('Complaint successfully created in DB:', complaint._id);

    // Notify officials of the department about new complaint
    try {
      const { createNotification } = require('../utils/notificationService');
      const { emitNewComplaint, emitNotification } = require('../config/socket');

      // Find all officials in this department
      const officials = await User.find({ role: 'official', department: category, isActive: true });

      const notificationMessage = `New complaint filed in ${category}: "${title}"`;

      // Create notifications and emit to each official
      for (const official of officials) {
        const notification = await createNotification(official._id, notificationMessage, complaint._id);

        // Emit real-time notification to this official
        if (notification) {
          emitNotification(official._id.toString(), {
            _id: notification._id,
            message: notificationMessage,
            complaint: complaint._id,
            isRead: false,
            createdAt: new Date()
          });
        }
      }

      // Emit new complaint event globally for sidebar updates
      emitNewComplaint(category, {
        _id: complaint._id,
        title: complaint.title,
        category: complaint.category,
        currentStatus: complaint.currentStatus,
        createdAt: complaint.createdAt,
        location: complaint.location
      });

      console.log(`✅ Notified ${officials.length} officials about new complaint`);
      console.log(`📢 Emitted new complaint event for sidebar updates`);
    } catch (notifError) {
      console.error('❌ Failed to create notifications:', notifError.message);
      // Don't throw - complaint was created successfully
    }


    // 5. Response Contract
    res.status(201).json({
      success: true,
      complaintId: complaint._id,
      message: "Complaint submitted successfully"
    });
  } catch (error) {
    console.error('Complaint creation failed:', error);
    // Ensure the error handler sends a proper response
    next(error);
  }
};

// @desc    Get user complaints
// @route   GET /api/complaints/my-complaints
// @access  Private (Citizen)
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json(complaints);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (for Official/Admin)
// @route   GET /api/complaints
// @access  Private (Official/Admin)
const getComplaints = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    // If official, maybe limit to their department?
    // For now, return all or filtered.

    const complaints = await Complaint.find(query)
      .populate('user', 'name mobile')
      .sort('-createdAt');

    res.status(200).json(complaints);
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name mobile') // Citizen who filed the complaint
      .populate('remarks.official', 'name'); // Official who made the remark

    if (!complaint) {
      const error = new Error('Complaint not found');
      res.status(404); // Set status for the error handler
      return next(error);
    }

    // Check if user is authorized to view
    // Citizen can view their own, Official/Admin can view all
    if (req.user.role === 'citizen' && complaint.user._id.toString() !== req.user.id) {
      const error = new Error('Not authorized to view this complaint');
      res.status(403); // 403 Forbidden is more appropriate
      return next(error);
    }

    res.status(200).json(complaint);
  } catch (error) {
    next(error); // Pass any other errors (e.g., DB connection) to the handler
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Official/Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      const error = new Error('Complaint not found');
      res.status(404);
      return next(error);
    }

    complaint.currentStatus = status;
    // Auto assign to updater if not assigned?
    if (!complaint.assignedTo) {
      complaint.assignedTo = req.user.id;
    }

    await complaint.save();

    // // Trigger a notification for the user
    // // await createNotification( // Notifications are explicitly excluded from this request
    //   complaint.user,
    //   `Your complaint "${complaint.title}" has been updated to "${status}".`
    // );

    res.status(200).json(complaint);
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint summary (for Official/Admin Dashboard)
// @route   GET /api/complaints/summary
// @access  Private (Official/Admin)
const getComplaintSummary = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ currentStatus: 'Pending' });
    const inProgress = await Complaint.countDocuments({ currentStatus: 'In Progress' });
    const resolved = await Complaint.countDocuments({ currentStatus: 'Resolved' });

    res.status(200).json({
      total,
      pending,
      inProgress,
      resolved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint analytics data (for Official/Admin Analytics)
// @route   GET /api/complaints/analytics
// @access  Private (Official/Admin)
const getComplaintAnalytics = async (req, res, next) => {
  try {
    // Complaint Volume over time (e.g., last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const complaintVolume = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Resolution Status
    const resolutionStatus = await Complaint.aggregate([
      { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
    ]);

    // SLA Compliance (example: complaints resolved within 7 days)
    const totalResolved = await Complaint.countDocuments({ currentStatus: 'RESOLVED' });
    const resolvedOnTime = await Complaint.countDocuments({
      currentStatus: 'RESOLVED',
      // Assuming a 'resolvedAt' field or similar for resolution time tracking
      // For now, we'll just use a placeholder or calculate based on createdAt
      // resolvedAt: { $lte: new Date(new Date().setDate(new Date().getDate() - 7)) }
    });
    const slaCompliance = totalResolved > 0 ? (resolvedOnTime / totalResolved) * 100 : 0;

    // Complaints by Category
    const complaintsByCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      complaintVolume,
      resolutionStatus,
      slaCompliance: parseFloat(slaCompliance.toFixed(2)),
      complaintsByCategory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getComplaintSummary,
  getComplaintAnalytics,
};
