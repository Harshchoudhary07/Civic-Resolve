const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return this.authProvider === 'local';
    },
  },
  role: {
    type: String,
    enum: ['citizen', 'official', 'admin', 'pending_official'],
    default: 'citizen',
  },
  department: {
    type: String,
    enum: ['Roads & Infrastructure', 'Sanitation', 'Electricity', 'Water Supply', 'Drainage', 'Traffic Management', 'Public Property', 'Encroachment', 'Others', null],
    default: null
  },
  // This field is crucial for the approval process
  isActive: {
    type: Boolean,
    default: false,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  mobileNumber: { type: String },
  profilePicture: { type: String },
  aadhar: { type: String, unique: true, sparse: true },
}, { timestamps: true });

// Hash password before saving the user
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new) and exists
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;