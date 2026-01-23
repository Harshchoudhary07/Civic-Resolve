const mongoose = require('mongoose');
const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');
const { getOfficialDashboard } = require('./src/services/officialService');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const verifyOfficial = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // 1. Create Hacky Official if not exists
        let official = await User.findOne({ email: 'official@test.com' });
        if (!official) {
            official = await User.create({
                name: 'Test Official',
                email: 'official@test.com',
                password: 'password123',
                role: 'official',
                department: 'Roads & Infrastructure', // Test Dept
                isActive: true,
                authProvider: 'local'
            });
            console.log('Created Test Official');
        } else {
            // Ensure existing user has department
            official.department = 'Roads & Infrastructure';
            official.role = 'official';
            await official.save();
            console.log('Updated Official Dept');
        }

        // 2. Ensure at least one complaint matches
        let complaint = await Complaint.findOneAndUpdate(
            { category: 'Roads & Infrastructure', currentStatus: 'Pending' },
            { priorityScore: 100 },
            { new: true }
        );

        if (!complaint) {
            // Seed one if missing
            complaint = await Complaint.create({
                title: 'Test Pothole',
                description: 'Test Desc',
                category: 'Roads & Infrastructure',
                user: official._id, // Self reported for ease
                currentStatus: 'Pending',
                priorityScore: 50,
                location: { sourceType: 'MANUAL', address: 'Test Loc' },
                attachments: [] // Required by schema?
            });
            console.log('Created Test Complaint');
        }

        // 3. Test Service Logic
        console.log('Fetching Dashboard...');
        const dashboard = await getOfficialDashboard(official._id);

        console.log(`FOUND ${dashboard.length} ITEMS IN DASHBOARD`);
        if (dashboard.length > 0) {
            dashboard.forEach((item, index) => {
                console.log(`[${index}] ${item.title} | Priority: ${item.priorityScore} | Status: ${item.currentStatus}`);
            });
        } else {
            console.log('Dashboard Empty! Check filters.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification Failed:', error);
        process.exit(1);
    }
};

verifyOfficial();
