const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateAccessToken, generateRefreshToken } = require('./tokenUtils');
const sendEmail = require('./emailService');

const OTP_COOLDOWN_SECONDS = 60; // 1 minute
const MAX_OTP_ATTEMPTS = 5;

const generateAndSendEmailOtp = async (email) => {
  // Resend Cooldown Check
  const lastOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
  if (lastOtp) {
    const timeDiff = (Date.now() - lastOtp.createdAt.getTime()) / 1000;
    if (timeDiff < OTP_COOLDOWN_SECONDS) {
      throw new Error(`Please wait ${Math.ceil(OTP_COOLDOWN_SECONDS - timeDiff)} seconds before resending OTP.`);
    }
  }

  // 1. Generate Random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // 2. Hash OTP
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);

  // 3. Store in DB
  await Otp.deleteMany({ email }); // Cleanup old OTPs for this email
  await Otp.create({
    email,
    otp: hashedOtp,
    attempts: 0
  });

  // 4. Send Email using the dedicated service
  const message = `<p>Your one-time verification code is: <strong>${otp}</strong></p><p>This code is valid for 5 minutes.</p>`;
  await sendEmail({
    email: email,
    subject: 'Your CivicResolve Verification Code',
    html: message,
  });
  return { success: true, message: 'OTP sent to email' };
};

const verifyEmailOtp = async (email, code) => {
  const otpRecord = await Otp.findOne({ email });

  if (!otpRecord) {
    throw new Error('OTP expired or not found.');
  }

  // Check Max Attempts
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new Error(`Too many failed attempts. Please request a new OTP.`);
  }

  const isMatch = await otpRecord.matchOtp(code);
  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new Error('Invalid OTP');
  }

  await Otp.deleteOne({ _id: otpRecord._id });

  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  // Mark user as verified if not already
  if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};

module.exports = { generateAndSendEmailOtp, verifyEmailOtp };