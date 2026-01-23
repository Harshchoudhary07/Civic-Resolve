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

    // 1. Status Breakdown
    const statusStats = await Complaint.aggregate([
        { $match: { category: department } },
        { $group: { _id: '$currentStatus', count: { $sum: 1 } } }
    ]);

    // 2. Complaint Volume (Monthly Trend - Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const volumeStats = await Complaint.aggregate([
        {
            $match: {
                category: department,
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 3. Heatmap Data (Coordinates)
    // Only fetch complaints with valid coordinates
    const heatmapData = await Complaint.find({
        category: department,
        'location.coordinates.coordinates': { $exists: true, $not: { $size: 0 } }
    }).select('location.coordinates priorityScore title');

    // 4. SLA Compliance (Resolved within 48h)
    // Assuming SLA is 48 hours for now. Ideally fetch from Department model.
    const resolvedComplaints = await Complaint.find({
        category: department,
        currentStatus: 'Resolved',
        'statusHistory.status': 'Resolved'
    }).select('createdAt statusHistory');

    let slaCompliantCount = 0;
    resolvedComplaints.forEach(c => {
        const resolutionEvent = c.statusHistory.find(h => h.status === 'Resolved');
        if (resolutionEvent) {
            const timeTaken = new Date(resolutionEvent.timestamp) - new Date(c.createdAt);
            const hoursTaken = timeTaken / (1000 * 60 * 60);
            if (hoursTaken <= 48) slaCompliantCount++;
        }
    });
    const slaCompliance = resolvedComplaints.length ? ((slaCompliantCount / resolvedComplaints.length) * 100).toFixed(1) : 0;

    // Helper to format breakdown for frontend
    const breakdown = statusStats.map(s => ({ _id: s._id.toUpperCase().replace(' ', '_'), count: s.count }));

    // Fill specific statuses if missing for frontend array consistency
    const ensureStatus = (status) => {
        if (!breakdown.find(b => b._id === status)) breakdown.push({ _id: status, count: 0 });
    };
    ['RESOLVED', 'PENDING', 'IN_PROGRESS', 'REJECTED'].forEach(ensureStatus);

    return {
        // Backend returns standard snake_case or camelCase, frontend maps it
        complaintVolume: volumeStats,
        resolutionStatus: breakdown,
        slaCompliance,
        heatmapData: heatmapData.map(c => ({
            id: c._id,
            lat: c.location.coordinates.coordinates[1],
            lng: c.location.coordinates.coordinates[0],
            weight: c.priorityScore, // Use priority as weight
            title: c.title
        }))
    };
};

module.exports = {
    getOfficialDashboard,
    getComplaintDetails,
    updateComplaintStatus,
    getDepartmentAnalytics
};
