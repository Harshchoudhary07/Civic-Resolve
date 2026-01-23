const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const AuditLog = require('../models/AuditLog');

/* --- AUDIT LOGGING --- */
const logAction = async (adminId, action, targetEntity, targetId, metadata = {}, ip = '0.0.0.0') => {
    try {
        await AuditLog.create({
            admin: adminId,
            action,
            targetEntity,
            targetId,
            metadata,
            ipAddress: ip
        });
    } catch (err) {
        console.error('Audit Log Failed:', err); // Non-blocking error
    }
};

/* --- USER MANAGEMENT --- */
const getAllUsers = async (query = {}) => {
    // Filter by role or status if provided
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.isActive = query.status === 'active';

    return await User.find(filter).select('-password');
};

const approveOfficial = async (adminId, userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.role !== 'official' && user.role !== 'pending_official') throw new Error('Not an official account');

    user.role = 'official'; // ensuring role is set
    user.isActive = true;
    await user.save();

    await logAction(adminId, 'APPROVE_USER', 'User', userId, { email: user.email });
    return user;
};

const banUser = async (adminId, userId, reason) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.role === 'admin') throw new Error('Cannot ban another admin');

    user.isActive = false; // "Banned" effectively means inactive in this system
    await user.save();

    await logAction(adminId, 'BAN_USER', 'User', userId, { reason, email: user.email });
    return user;
};

const activateUser = async (adminId, userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.isActive = true;
    await user.save();

    await logAction(adminId, 'UNBAN_USER', 'User', userId, { email: user.email });
    return user;
};

const assignDepartment = async (adminId, userId, departmentName) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.role !== 'official') throw new Error('Can only assign department to officials');

    const oldDept = user.department;
    user.department = departmentName;
    await user.save();

    await logAction(adminId, 'ASSIGN_DEPARTMENT', 'User', userId, { oldDept, newDept: departmentName });
    return user;
};

/* --- COMPLAINT OVERSIGHT --- */
const getAllComplaints = async (query = {}, page = 1, limit = 20) => {
    const filter = {};
    if (query.status) filter.currentStatus = query.status;
    if (query.category) filter.category = query.category;
    if (query.archived) filter.isArchived = query.archived === 'true';

    const complaints = await Complaint.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await Complaint.countDocuments(filter);

    return { complaints, total, page, pages: Math.ceil(total / limit) };
};

const archiveComplaint = async (adminId, complaintId, reason) => {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    complaint.isArchived = true;
    await complaint.save();

    await logAction(adminId, 'ARCHIVE_COMPLAINT', 'Complaint', complaintId, { reason });
    return complaint;
};

const overrideStatus = async (adminId, complaintId, newStatus, reason) => {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const oldStatus = complaint.currentStatus;
    complaint.currentStatus = newStatus;

    // Admin override entry in history
    complaint.statusHistory.push({
        status: newStatus,
        updatedBy: adminId,
        remark: `ADMIN OVERRIDE: ${reason}`,
        timestamp: new Date()
    });

    await complaint.save();

    await logAction(adminId, 'OVERRIDE_STATUS', 'Complaint', complaintId, { oldStatus, newStatus, reason });
    return complaint;
};

/* --- ANALYTICS --- */
const getSystemAnalytics = async () => {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ currentStatus: 'Resolved' });

    // Aggregation: Count by Department
    const byDepartment = await Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Aggregation: Count by Status
    const byStatus = await Complaint.aggregate([
        { $group: { _id: '$currentStatus', count: { $sum: 1 } } }
    ]);

    return {
        total: totalComplaints,
        resolved: resolvedComplaints,
        resolutionRate: totalComplaints ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0,
        byDepartment,
        byStatus
    };
};

/* --- DEPARTMENT MANAGEMENT --- */
const createDepartment = async (adminId, data) => {
    const exists = await Department.findOne({ name: data.name });
    if (exists) throw new Error('Department already exists');

    const department = await Department.create(data);
    await logAction(adminId, 'CREATE_DEPARTMENT', 'Department', department._id, { name: department.name });
    return department;
};

const getAllDepartments = async () => {
    return await Department.find({ isActive: true });
};

module.exports = {
    getAllUsers,
    approveOfficial,
    banUser,
    activateUser,
    assignDepartment,
    getAllComplaints,
    archiveComplaint,
    overrideStatus,
    getSystemAnalytics,
    createDepartment,
    getAllDepartments
};
