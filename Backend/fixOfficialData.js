const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const fixOfficials = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const officials = await User.find({ role: 'official', department: null });
        console.log(`Found ${officials.length} officials without department.`);

        for (const user of officials) {
            user.department = 'Roads & Infrastructure'; // Default assignment
            await user.save();
            console.log(`Updated ${user.email} -> Roads & Infrastructure`);
        }

        console.log('Fixed all officials.');
        process.exit(0);
    } catch (error) {
        console.error('Fix Failed:', error);
        process.exit(1);
    }
};

fixOfficials();
