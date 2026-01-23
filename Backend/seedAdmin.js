const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminMobile = '9999999999'; // Default admin mobile

    let admin = await User.findOne({ mobile: adminMobile });

    if (admin) {
      admin.role = 'admin';
      admin.accountStatus = 'Active';
      admin.isActive = true; // Ensure admin is active
      await admin.save();
      console.log('Existing user updated to Active Admin');
    } else {
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@system.com',
        mobile: adminMobile,
        role: 'admin',
        isActive: true, // Ensure admin is active
        accountStatus: 'Active',
        aadhar: '000000000000'
      });
      console.log('New Active Admin created');
    }

    console.log(`Admin credentials: Mobile - ${adminMobile}`);
    console.log('Use this mobile number to login. OTP will be shown in alert.');
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
