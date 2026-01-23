const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const debugUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const targetMobile = '7323956532';
    
    console.log(`Checking for user with mobile: '${targetMobile}'`);
    const user = await User.findOne({ mobile: targetMobile });
    
    if (user) {
      console.log('FOUND USER:', user);
    } else {
      console.log('USER NOT FOUND with exact match.');
      
      // List all users to see what's there
      console.log('Listing ALL users to find potential mismatch:');
      const allUsers = await User.find({});
      allUsers.forEach(u => {
        console.log(`- Name: ${u.name}, Mobile: '${u.mobile}', Role: ${u.role}, Status: ${u.accountStatus}`);
      });
    }

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

debugUser();
