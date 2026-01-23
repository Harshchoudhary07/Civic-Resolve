const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const activateUserByEmail = async (email) => {
  if (!email) {
    console.error('ERROR: Please provide an email address as an argument.');
    console.log('Usage: node activateUser.js <email_to_activate>');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected.');

    const user = await User.findOne({ email: email });

    if (user) {
      console.log(`Found user: ${user.name} (${user.email}). Current 'isActive' status: ${user.isActive}`);
      user.isActive = true;
      await user.save();
      console.log(`✅ User ${user.email} has been successfully activated.`);
    } else {
      console.log(`❌ No user found with email: ${email}`);
    }

    await mongoose.disconnect();
    process.exit();
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
};

// Get email from command line arguments
const emailToActivate = process.argv[2];
activateUserByEmail(emailToActivate);