const express = require('express');
const router = express.Router();
const { loginUser, registerUser, googleLogin, logoutUser, getMe, verifyEmailOtpController, resendVerificationOtpController } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// @route   /api/auth

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify-email-otp', verifyEmailOtpController);
router.post('/resend-verification', resendVerificationOtpController);
router.post('/google', googleLogin);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
// Add other auth routes like /forgot-password, /reset-password here

module.exports = router;