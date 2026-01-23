const Complaint = require('../models/Complaint');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');

class FeedService {

    // Calculate priority score
    calculatePriorityScore(upvoteCount, commentCount, status, createdAt) {
        let score = (upvoteCount * 5) + (commentCount * 10);

        // Status multipliers
        if (status === 'In Progress') {
            score *= 1.2;
        } else if (status === 'Resolved' || status === 'Rejected') {
            score = 0; // Rank resolved/rejected items lowest
        }

        // You could add time decay here if desired, but for now we rely on sorting
        return Math.round(score);
    }

    // Get Feed
    async getFeed(page = 1, limit = 10, sortBy = 'priority') {
        const skip = (page - 1) * limit;

        let sortOptions = {};
        if (sortBy === 'priority') {
            sortOptions = { priorityScore: -1, createdAt: -1 };
        } else if (sortBy === 'newest') {
            sortOptions = { createdAt: -1 };
        }

        const complaints = await Complaint.find({ isArchived: false })
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .populate('user', 'name profilePicture') // Populate author details
            .select('title description attachments location currentStatus upvoteCount commentCount priorityScore createdAt');

        return complaints;
    }

    // Toggle Upvote
    async toggleUpvote(userId, complaintId) {
        const existingVote = await Vote.findOne({ user: userId, complaint: complaintId });
        const complaint = await Complaint.findById(complaintId);

        if (!complaint) throw new Error('Complaint not found');

        if (existingVote) {
            // Remove vote
            await Vote.deleteOne({ _id: existingVote._id });
            complaint.upvoteCount = Math.max(0, complaint.upvoteCount - 1);
        } else {
            // Add vote
            await Vote.create({ user: userId, complaint: complaintId, type: 'upvote' });
            complaint.upvoteCount += 1;
        }

        // Recalculate Priority
        complaint.priorityScore = this.calculatePriorityScore(
            complaint.upvoteCount,
            complaint.commentCount,
            complaint.currentStatus,
            complaint.createdAt
        );

        await complaint.save();
        return { upvoted: !existingVote, upvoteCount: complaint.upvoteCount };
    }

    // Add Comment
    async addComment(userId, complaintId, content) {
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) throw new Error('Complaint not found');

        const comment = await Comment.create({
            user: userId,
            complaint: complaintId,
            content
        });

        complaint.commentCount += 1;
        // Recalculate Priority
        complaint.priorityScore = this.calculatePriorityScore(
            complaint.upvoteCount,
            complaint.commentCount,
            complaint.currentStatus,
            complaint.createdAt
        );
        await complaint.save();

        return await comment.populate('user', 'name profilePicture');
    }

    // Get Comments
    async getComments(complaintId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await Comment.find({ complaint: complaintId, isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'name profilePicture');
    }
}

module.exports = new FeedService();
