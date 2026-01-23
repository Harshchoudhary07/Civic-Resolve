const asyncHandler = require('express-async-handler');
const feedService = require('../services/feedService');

// @desc    Get social feed
// @route   GET /api/feed
// @access  Private (Citizen/Official)
const getFeed = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'priority';

    const feed = await feedService.getFeed(page, limit, sortBy);
    res.json(feed);
});

// @desc    Toggle upvote on a complaint
// @route   POST /api/feed/:id/upvote
// @access  Private (Citizen only)
const upvoteComplaint = asyncHandler(async (req, res) => {
    const result = await feedService.toggleUpvote(req.user.id, req.params.id);
    res.json(result);
});

// @desc    Add comment to a complaint
// @route   POST /api/feed/:id/comment
// @access  Private (Citizen only)
const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        res.status(400);
        throw new Error('Comment content is required');
    }

    const comment = await feedService.addComment(req.user.id, req.params.id, content);
    res.status(201).json(comment);
});

// @desc    Get comments for a complaint
// @route   GET /api/feed/:id/comments
// @access  Private
const getComments = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const comments = await feedService.getComments(req.params.id, page, limit);
    res.json(comments);
});

module.exports = {
    getFeed,
    upvoteComplaint,
    addComment,
    getComments
};
