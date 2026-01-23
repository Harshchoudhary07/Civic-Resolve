const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mobileNumber: user.mobileNumber,
      profilePicture: user.profilePicture,
      department: user.department,
      aadhar: user.aadhar,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
    if (user.role === 'official' || user.role === 'admin') {
      user.department = req.body.department || user.department;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      mobileNumber: updatedUser.mobileNumber,
      profilePicture: updatedUser.profilePicture,
      department: updatedUser.department,
      aadhar: updatedUser.aadhar,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile picture
// @route   PUT /api/users/profile/picture
// @access  Private
const updateUserProfilePicture = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file.');
  }

  const b64 = Buffer.from(req.file.buffer).toString("base64");
  let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'civic-resolve-avatars',
    public_id: user._id.toString(),
    overwrite: true,
    resource_type: 'image',
  });

  user.profilePicture = result.secure_url;
  await user.save();

  res.json({ message: 'Profile picture updated successfully', profilePicture: result.secure_url });
});

module.exports = { getUserProfile, updateUserProfile, updateUserProfilePicture };