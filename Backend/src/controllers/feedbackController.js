const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedbacks
// @access  Private (Citizen)
const createFeedback = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const feedback = await Feedback.create({
        user: req.user._id,
        rating,
        comment,
        role: 'Citizen', // Assuming currently only citizens give feedback
        location: req.user.city || 'India' // Just a placeholder if we don't have city in User model
    });

    res.status(201).json(feedback);
});

// @desc    Get all feedbacks
// @route   GET /api/feedbacks
// @access  Public
const getAllFeedbacks = asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
});

// @desc    Seed initial feedbacks
const seedFeedbacks = async () => {
    const count = await Feedback.countDocuments();
    if (count === 0) {
        const dummyFeedbacks = [
            {
                rating: 5,
                comment: "Finally, a system that works! I can see exactly who's handling my complaint and when it will be resolved. The transparency is incredible.",
                role: "Citizen",
                location: "Mumbai"
            },
            {
                rating: 5,
                comment: "The auto-escalation feature is a game-changer. My complaint was stuck for days, but it automatically went to higher authorities and got resolved immediately.",
                role: "Citizen",
                location: "Delhi"
            },
            {
                rating: 5,
                comment: "As a government official, this platform has streamlined our workflow. We can prioritize urgent issues and track our performance metrics easily.",
                role: "PWD Official",
                location: "Bangalore"
            },
            {
                rating: 4,
                comment: "Very intuitive interface. Raising a complaint takes less than 2 minutes. Great initiative for civic problem resolution.",
                role: "Citizen",
                location: "Pune"
            },
            {
                rating: 5,
                comment: "I love the real-time updates feature. No more visiting government offices to check status. CivicResolve brings governance to our fingertips.",
                role: "Citizen",
                location: "Hyderabad"
            }
        ];

        await Feedback.insertMany(dummyFeedbacks);
        console.log('✅ Initial feedbacks seeded successfully');
    }
};

module.exports = { createFeedback, getAllFeedbacks, seedFeedbacks };
