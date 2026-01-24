/**
 * List All Officials
 * Purpose: Display all official users and their departments
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');

async function listOfficials() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        const officials = await User.find({ role: 'official' }).sort({ department: 1 });

        console.log('='.repeat(80));
        console.log('OFFICIAL USERS - LOGIN CREDENTIALS');
        console.log('='.repeat(80));
        console.log('');

        for (const official of officials) {
            const complaintCount = await Complaint.countDocuments({ category: official.department });
            console.log(`Department: ${official.department}`);
            console.log(`Name: ${official.name}`);
            console.log(`Email: ${official.email}`);
            console.log(`Complaints: ${complaintCount}`);
            console.log(`Password: Official@123`);
            console.log('-'.repeat(80));
        }

        console.log(`\nTotal Officials: ${officials.length}`);
        console.log('');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

listOfficials();
