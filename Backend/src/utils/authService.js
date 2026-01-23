const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('./emailService');
const { OAuth2Client } = require('google-auth-library');
const { generateAccessToken, generateRefreshToken } = require('./tokenUtils');

const registerUser = async (userData) => {
  const { name, email, password, role, department, mobileNumber, aadhar } = userData;

  // Email is now required and unique
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error('User with this email already exists');

  // Mobile number is optional, but if provided, it must be unique
  // It can be used multiple times if roles are different
  if (mobileNumber && mobileNumber.trim() !== '') { // Ensure mobileNumber is not empty or just whitespace
    const mobileUserExists = await User.findOne({ mobileNumber, role }); // Check for same mobile and same role
    // If a user with the same mobile number and the same role already exists, throw an error
    // This allows different roles to share a mobile number
    if (mobileUserExists) throw new Error('User with this mobile number already exists');
  }

  // If role is official, set status to pending for admin approval
  const accountStatus = role === 'official' ? 'pending' : 'active';

  const user = await User.create({
    name,
    email,
    password,
    role,
    department,
    mobileNumber,
    aadhar,
    accountStatus
  });

  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check Account Lockout
  if (user.lockUntil && user.lockUntil > Date.now()) {
    throw new Error(`Account locked. Try again after ${Math.ceil((user.lockUntil - Date.now()) / 60000)} minutes`);
  }

  // Check Password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
    }
    await user.save();
    throw new Error('Invalid credentials');
  }

  // Reset Lockout on Success
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  if (user.accountStatus !== 'active') {
    throw new Error('Account is not active. Please contact support.');
  }

  return user;
};

const refreshTokens = async (refreshToken) => {
  // Logic to verify refresh token and issue new pair
  // In a real app, you might check a Redis whitelist/blacklist here
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
  const user = await User.findById(decoded.id);
  if (!user) throw new Error('User not found');

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user); // Rotate refresh token

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const requestPasswordReset = async (email, origin) => {
  const user = await User.findOne({ email });
  if (!user) {
    // For security, don't reveal that the user doesn't exist.
    // The controller will send a generic success message regardless.
    return;
  }

  // Generate the plain reset token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token and save it to the user document
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token is valid for 10 minutes

  await user.save();

  // Create the full reset URL for the email
  const resetUrl = `${origin}/reset-password/${resetToken}`;
  const message = `
    <h1>You have requested a password reset</h1>
    <p>Please click on the following link to reset your password:</p>
    <a href="${resetUrl}" target="_blank" rel="noopener noreferrer">${resetUrl}</a>
    <p>This link is valid for only 10 minutes.</p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset Token (Valid for 10 min)',
      html: message,
    });
  } catch (error) {
    console.error('Password reset email sending failed:', error);
    // If email fails, clear the token from the DB to allow a retry
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw new Error('There was an error sending the password reset email.');
  }
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Check if token is not expired
  });

  if (!user) {
    throw new Error('Token is invalid or has expired.');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};

const handleGoogleLogin = async (credential) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { name, email, picture, email_verified } = payload;

  if (!email || !email_verified) {
    throw new Error('Google account must have a verified email to proceed.');
  }

  let user = await User.findOne({ email });

  if (user) {
    if (!user.isActive) {
      user.isActive = true;
    }
    if (!user.role) {
      user.role = 'citizen';
    }
    user.authProvider = 'google';
    user.name = name;
    user.profilePicture = user.profilePicture || picture;
    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      profilePicture: picture,
      role: 'citizen', // Default role for all Google sign-ups
      isActive: true, // Google users are verified, so they can be active immediately
      authProvider: 'google',
    });
  }

  return user;
};


module.exports = { registerUser, loginUser, refreshTokens, requestPasswordReset, resetPassword, handleGoogleLogin };