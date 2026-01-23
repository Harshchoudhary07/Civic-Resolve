const Complaint = require('../models/Complaint');
const User = require('../models/User');

/**
 * Get prioritized dashboard for an official
 * Sorts by priorityScore (desc) and filters by department
 */
const getOfficialDashboard = async (officialId, filters = {}) => {
    const official = await User.findById(officialId);
    if (!official || official.role !== 'official') {
        throw new Error('User is not an authorized official');
    }

    const department = official.department;
    if (!department) {
        throw new Error('Official is not assigned to any department');
    }

    // Base Match Stage: Open/InProgress & Matching Department
    const matchStage = {
        category: department,
        currentStatus: { $in: ['Pending', 'In Progress', 'Escalated'] }
    };

    // Add filters if any (e.g., search)
    if (filters.status) matchStage.currentStatus = filters.status;

    const dashboardData = await Complaint.aggregate([
        { $match: matchStage },
        {
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                currentStatus: 1,
                priorityScore: 1,
                location: 1,
                upvoteCount: 1,
                commentCount: 1,
                createdAt: 1,
                images: '$attachments' // Alias for frontend
            }
        },
        { $sort: { priorityScore: -1, createdAt: -1 } } // Highest priority first
    ]);

    return dashboardData;
};

/**
 * Get details for a specific complaint
 */
const getComplaintDetails = async (complaintId, officialId) => {
    const official = await User.findById(officialId);
    if (!official) throw new Error('Official not found');

    const complaint = await Complaint.findById(complaintId)
        .populate('user', 'name email')
        .populate('statusHistory.updatedBy', 'name role')
        .populate('remarks.official', 'name');

    if (!complaint) throw new Error('Complaint not found');

    // Access Control: Official can only view their department
    if (complaint.category !== official.department) {
        throw new Error('Access Denied: This complaint belongs to another department');
    }

    return complaint;
};

/**
 * Update complaint status and add remark
 */
const updateComplaintStatus = async (complaintId, officialId, newStatus, remarkText) => {
    const official = await User.findById(officialId);
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) throw new Error('Complaint not found');
    if (complaint.category !== official.department) throw new Error('Access Denied');

    // Validate Status Transition (Basic)
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid Status');

    // Update Fields
    complaint.currentStatus = newStatus;

    // Add to History
    complaint.statusHistory.push({
        status: newStatus,
        updatedBy: officialId,
        remark: remarkText,
        timestamp: new Date()
    });

    // Add Remark if provided
    if (remarkText) {
        complaint.remarks.push({
            official: officialId,
            text: remarkText
        });
    }

    // Logic: If resolved, set priority to 0
    if (newStatus === 'Resolved' || newStatus === 'Rejected') {
        complaint.priorityScore = 0;
    }

    await complaint.save();
    return complaint;
};

/**
 * Get Analytics for the official's department
 */
const getDepartmentAnalytics = async (officialId) => {
    const official = await User.findById(officialId);
    const department = official.department;

    const stats = await Complaint.aggregate([
        { $match: { category: department } },
        {
            $group: {
                _id: '$currentStatus',
                count: { $sum: 1 },
                avgPriority: { $avg: '$priorityScore' }
            }
        }
    ]);

    // Format output
    const result = {
        total: 0,
        breakdown: {}
    };

    stats.forEach(s => {
        result.breakdown[s._id] = s.count;
        result.total += s.count;
    });

    return result;
};

module.exports = {
    getOfficialDashboard,
    getComplaintDetails,
    updateComplaintStatus,
    getDepartmentAnalytics
};
