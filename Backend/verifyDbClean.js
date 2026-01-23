const mongoose = require('mongoose');
const Complaint = require('./src/models/Complaint');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const verify = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('---START VERIFICATION---');

        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections Found:', collections.map(c => c.name).join(', '));

        // Count complaints
        const count = await Complaint.countDocuments();
        console.log('Total Complaints:', count);

        console.log('---END VERIFICATION---');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verify();
