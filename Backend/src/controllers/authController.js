const User = require('../models/User');
const Otp = require('../models/Otp');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/emailService'); // Assuming this service exists for sending emails
const authService = require('../utils/authService');

// Function to generate JWT
const generateToken = (user) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
    console.error("CRITICAL ERROR: JWT_SECRET is not defined or is empty in environment variables!");
    throw new Error("JWT_SECRET is not configured correctly.");
  }
  // Create a payload with essential, non-sensitive user data
  const payload = {
    id: user._id,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d', // Shorter token life for better security
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  // Check if user exists, password matches, and account is active
  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(403); // Forbidden
      throw new Error('Your account has been deactivated. Please contact support.');
    }
    res.json({
      success: true, // Add this for frontend to recognize success
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      profilePicture: user.profilePicture,
      token: generateToken(user),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, aadhar, mobileNumber, department } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists.');
  }

  // Create user but keep them inactive until OTP verification
  let finalRole = 'citizen'; // Default to citizen
  if (role === 'official') {
    finalRole = 'official';
  } else if (role === 'admin') {
    finalRole = 'admin';
  }

  const user = await User.create({
    name,
    email,
    password,
    aadhar,
    mobileNumber,
    department,
    role: finalRole,
    isActive: false, // User is inactive until email is verified
  });

  if (user) {
    // Generate and send OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    await Otp.deleteMany({ email }); // Clean up old OTPs
    await Otp.create({ email, otp: hashedOtp });

    const message = `<p>Your one-time verification code is: <strong>${otp}</strong></p><p>This code is valid for 5 minutes.</p>`;
    await sendEmail({
      email: email,
      subject: 'Your CivicResolve Verification Code',
      html: message,
    });

    res.status(201).json({ success: true, message: `Registration successful. An OTP has been sent to ${email}.` });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Verify email OTP and activate user
// @route   POST /api/auth/verify-email-otp
// @access  Public
const verifyEmailOtpController = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await Otp.findOne({ email });
  if (!otpRecord) {
    res.status(400);
    throw new Error('OTP expired or is invalid. Please request a new one.');
  }

  if (otpRecord.attempts >= 5) {
    await Otp.deleteOne({ _id: otpRecord._id });
    res.status(400);
    throw new Error('Too many failed attempts. Please request a new OTP.');
  }

  const isMatch = await otpRecord.matchOtp(otp);
  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    res.status(400);
    throw new Error('Invalid OTP provided.');
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  user.isActive = true;
  await user.save();
  await Otp.deleteOne({ _id: otpRecord._id });

  res.json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    profilePicture: user.profilePicture,
    token: generateToken(user),
  });
});

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationOtpController = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('No account found with this email address.');
  }
  if (user.isActive) {
    res.status(400);
    throw new Error('This account is already verified.');
  }

  const OTP_COOLDOWN_SECONDS = 60;
  const lastOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (lastOtp) {
    const timeDiff = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
    if (timeDiff < OTP_COOLDOWN_SECONDS) {
      res.status(429);
      throw new Error(`Please wait ${Math.ceil(OTP_COOLDOWN_SECONDS - timeDiff)} seconds before resending OTP.`);
    }
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);

  await Otp.deleteMany({ email });
  await Otp.create({ email, otp: hashedOtp });

  const message = `<p>Your new one-time verification code is: <strong>${otp}</strong></p><p>This code is valid for 5 minutes.</p>`;
  await sendEmail({
    email: email,
    subject: 'Your New CivicResolve Verification Code',
    html: message,
  });

  res.json({ success: true, message: 'A new OTP has been sent to your email.' });
});

// @desc    Handle Google OAuth login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
  console.log('Received /api/auth/google request with body:', req.body);

  const { credential } = req.body;

  if (!credential) {
    res.status(400);
    throw new Error('Google token is required');
  }

  // Delegate the core logic to the auth service
  const user = await authService.handleGoogleLogin(credential);

  // Create the response payload
  const responsePayload = {
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    profilePicture: user.profilePicture,
    token: generateToken(user),
  };

  console.log('Sending response for Google login:', responsePayload);
  res.json(responsePayload);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  // For stateless JWT, logout is a client-side responsibility (clearing the token).
  // This endpoint provides a conventional way for the client to signal logout
  // and for the server to acknowledge.
  res.status(200).json({ success: true, message: 'Logout successful' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // The user object is attached to the request by the 'protect' middleware.
  res.status(200).json(req.user);
});

module.exports = { loginUser, registerUser, googleLogin, logoutUser, getMe, verifyEmailOtpController, resendVerificationOtpController };