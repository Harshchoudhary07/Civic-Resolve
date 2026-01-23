const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const fixUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminMobile = '9999999999';
    
    // Find using regex to ignore potential whitespace
    const admin = await User.findOne({ mobile: { $regex: /9999999999/ } });

    if (admin) {
      console.log(`Found Admin. Current Mobile: '${admin.mobile}'`);
      
      // Update with clean mobile number
      admin.mobile = '9999999999';
      await admin.save();
      console.log('Admin mobile number normalized/fixed.');
    } else {
      console.log('Admin not found even with regex.');
    }

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixUser();
