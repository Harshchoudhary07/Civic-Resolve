const express = require('express');
const router = express.Router();
const { getFeed, upvoteComplaint, addComment, getComments } = require('../controllers/feedController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/', protect, getFeed);
router.post('/:id/upvote', protect, authorize('citizen'), upvoteComplaint);
router.post('/:id/comment', protect, authorize('citizen'), addComment);
router.get('/:id/comments', protect, getComments);

module.exports = router;
