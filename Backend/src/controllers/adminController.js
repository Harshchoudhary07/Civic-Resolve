const asyncHandler = require('express-async-handler');
const adminService = require('../services/adminService');

// --- USER MANAGEMENT ---

// @desc    Get all users (paginated/filtered)
// @route   GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
    const users = await adminService.getAllUsers(req.query);
    res.status(200).json({ success: true, count: users.length, data: users });
});

// @desc    Approve official registration
// @route   PUT /api/admin/users/:id/approve
const approveUser = asyncHandler(async (req, res) => {
    const user = await adminService.approveOfficial(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'Official approved successfully', data: user });
});

const banUser = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const user = await adminService.banUser(req.user._id, req.params.id, reason);
    res.status(200).json({ success: true, message: 'User banned successfully', data: user });
});

// @desc    Activate/Unban user
// @route   PUT /api/admin/users/:id/activate
const activateUser = asyncHandler(async (req, res) => {
    const user = await adminService.activateUser(req.user._id, req.params.id);
    res.status(200).json({ success: true, message: 'User activated successfully', data: user });
});

// @desc    Assign department to official
// @route   PUT /api/admin/users/:id/assign-department
const assignDepartment = asyncHandler(async (req, res) => {
    const { department } = req.body;
    if (!department) {
        res.status(400);
        throw new Error('Department name is required');
    }
    const user = await adminService.assignDepartment(req.user._id, req.params.id, department);
    res.status(200).json({ success: true, message: `Assigned to ${department}`, data: user });
});

// --- COMPLAINT OVERSIGHT ---

// @desc    Get all complaints (Global View)
// @route   GET /api/admin/complaints
const getComplaints = asyncHandler(async (req, res) => {
    const { complaints, total, pages } = await adminService.getAllComplaints(req.query, req.query.page || 1);
    res.status(200).json({ success: true, count: total, pages, data: complaints });
});

// @desc    Archive a complaint (Spam/Abuse)
// @route   PUT /api/admin/complaints/:id/archive
const archiveComplaint = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const complaint = await adminService.archiveComplaint(req.user._id, req.params.id, reason);
    res.status(200).json({ success: true, message: 'Complaint archived', data: complaint });
});

// @desc    Override complaint status
// @route   PUT /api/admin/complaints/:id/override-status
const overrideStatus = asyncHandler(async (req, res) => {
    const { status, reason } = req.body;
    if (!status || !reason) {
        res.status(400);
        throw new Error('New status and reason are required');
    }
    const complaint = await adminService.overrideStatus(req.user._id, req.params.id, status, reason);
    res.status(200).json({ success: true, message: 'Status overridden', data: complaint });
});

// --- ANALYTICS & CONFIG ---

// @desc    Get system-wide analytics
// @route   GET /api/admin/analytics
const getAnalytics = asyncHandler(async (req, res) => {
    const stats = await adminService.getSystemAnalytics();
    res.status(200).json({ success: true, data: stats });
});

// @desc    Create new department
// @route   POST /api/admin/departments
const createDepartment = asyncHandler(async (req, res) => {
    const department = await adminService.createDepartment(req.user._id, req.body);
    res.status(201).json({ success: true, data: department });
});

// @desc    Get all departments
// @route   GET /api/admin/departments
const getDepartments = asyncHandler(async (req, res) => {
    const departments = await adminService.getAllDepartments();
    res.status(200).json({ success: true, count: departments.length, data: departments });
});

module.exports = {
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
};
