const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document automatically deleted after 5 minutes (300 seconds)
  },
  attempts: {
    type: Number,
    default: 0
  }
});

// Method to verify OTP
otpSchema.methods.matchOtp = async function(enteredOtp) {
  return await bcrypt.compare(enteredOtp, this.otp);
};

// Compound index for faster lookups and potential unique constraints if needed
otpSchema.index({ email: 1 });

module.exports = mongoose.model('Otp', otpSchema);