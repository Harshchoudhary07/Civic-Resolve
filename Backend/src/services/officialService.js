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

    console.log(`[Dashboard] Official: ${official.name}, Department: ${department}`);

    // Base Match Stage: Open/InProgress & Matching Department
    const matchStage = {
        category: department,
        currentStatus: { $in: ['Pending', 'In Progress', 'Escalated'] }
    };

    // Add filters if any (e.g., search)
    if (filters.status) matchStage.currentStatus = filters.status;

    console.log(`[Dashboard] Match Stage:`, matchStage);

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

    console.log(`[Dashboard] Found ${dashboardData.length} complaints`);

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
    const complaint = await Complaint.findById(complaintId).populate('user', 'name email');

    if (!complaint) throw new Error('Complaint not found');
    if (complaint.category !== official.department) throw new Error('Access Denied');

    // Validate Status Transition (Basic)
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated'];
    if (!validStatuses.includes(newStatus)) throw new Error('Invalid Status');

    const oldStatus = complaint.currentStatus;

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

    // Emit real-time update via Socket.IO
    try {
        const { emitComplaintUpdate } = require('../config/socket');
        emitComplaintUpdate(complaintId, {
            status: newStatus,
            remark: remarkText,
            updatedBy: official.name
        });
    } catch (socketError) {
        console.error('Socket.IO emit error:', socketError.message);
    }

    // Create notification for the citizen
    const { createNotification } = require('../utils/notificationService');
    const sendEmail = require('../utils/emailService');

    const notificationMessage = `Your complaint "${complaint.title}" status has been updated from "${oldStatus}" to "${newStatus}"${remarkText ? ` with remark: "${remarkText}"` : ''}.`;

    await createNotification(complaint.user._id, notificationMessage, complaintId);

    // Send email notification
    try {
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF9933 0%, #FF6600 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">CivicResolve</h1>
                    <p style="color: white; margin: 5px 0 0 0; font-size: 14px;">Complaint Status Update</p>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333;">Hello ${complaint.user.name},</h2>
                    <p style="color: #666; line-height: 1.6;">Your complaint has been updated by our team.</p>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #FF9933; margin-top: 0;">Complaint Details</h3>
                        <p style="margin: 10px 0;"><strong>Title:</strong> ${complaint.title}</p>
                        <p style="margin: 10px 0;"><strong>ID:</strong> #${complaint._id.toString().slice(-6)}</p>
                        <p style="margin: 10px 0;"><strong>Previous Status:</strong> <span style="color: #999;">${oldStatus}</span></p>
                        <p style="margin: 10px 0;"><strong>New Status:</strong> <span style="color: #FF9933; font-weight: bold;">${newStatus}</span></p>
                        ${remarkText ? `<p style="margin: 10px 0;"><strong>Official Remark:</strong> "${remarkText}"</p>` : ''}
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">Thank you for using CivicResolve. We're working hard to address your concerns.</p>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/citizen/complaint/${complaintId}" 
                           style="background: #FF9933; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                            View Complaint Details
                        </a>
                    </div>
                </div>
                <div style="background: #333; padding: 20px; text-align: center; color: #999; font-size: 12px;">
                    <p>© 2026 CivicResolve. All rights reserved.</p>
                </div>
            </div>
        `;

        await sendEmail({
            email: complaint.user.email,
            subject: `Complaint Status Updated: ${newStatus} - CivicResolve`,
            html: emailHtml
        });

        console.log(`✅ Email sent to ${complaint.user.email} for complaint ${complaintId}`);
    } catch (emailError) {
        console.error('❌ Failed to send email:', emailError.message);
        // Don't throw error - notification still created
    }

    return complaint;
};

/**
 * Get Analytics for the official's department
 */
const getDepartmentAnalytics = async (officialId) => {
    const official = await User.findById(officialId);
    const department = official.department;

    console.log(`[Analytics] Official: ${official.name}, Department: ${department}`);

    // 1. Status Breakdown
    const statusStats = await Complaint.aggregate([
        { $match: { category: department } },
        { $group: { _id: '$currentStatus', count: { $sum: 1 } } }
    ]);

    console.log(`[Analytics] Status Stats:`, statusStats);

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
    const breakdown = {};
    statusStats.forEach(s => {
        breakdown[s._id] = s.count;
    });

    // Ensure all expected statuses exist with 0 if missing
    const expectedStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected', 'Escalated'];
    expectedStatuses.forEach(status => {
        if (!breakdown[status]) {
            breakdown[status] = 0;
        }
    });


    // Calculate total count
    const total = await Complaint.countDocuments({ category: department });

    console.log(`[Analytics] Total complaints for ${department}: ${total}`);
    console.log(`[Analytics] Breakdown:`, breakdown);

    return {
        total, // Total complaints for this department
        breakdown, // Status breakdown object
        complaintVolume: volumeStats,
        resolutionStatus: breakdown, // Keep for backward compatibility
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
