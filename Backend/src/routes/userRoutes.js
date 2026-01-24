const express = require('express');
const router = express.Router();
const { updateUserProfile, updateUserProfilePicture, getUserProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.route('/profile/picture').put(protect, upload.single('profilePicture'), updateUserProfilePicture);

module.exports = router;