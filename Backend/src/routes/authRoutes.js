const express = require('express');
const router = express.Router();
const { loginUser, registerUser, googleLogin, logoutUser, getMe, verifyEmailOtpController, resendVerificationOtpController, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// @route   /api/auth

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify-email-otp', verifyEmailOtpController);
router.post('/resend-verification', resendVerificationOtpController);
router.post('/google', googleLogin);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;