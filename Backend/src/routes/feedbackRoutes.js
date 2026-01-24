const express = require('express');
const router = express.Router();
const { createFeedback, getAllFeedbacks } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, authorize('citizen'), createFeedback)
    .get(getAllFeedbacks);

module.exports = router;
