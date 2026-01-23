const mongoose = require('mongoose');
const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');
const { getOfficialDashboard, getDepartmentAnalytics } = require('./src/services/officialService');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const verify = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        const official = await User.findOne({ email: 'official@test.com' }); // Ensure this matches your test user
        if (!official) throw new Error('Official not found');

        console.log(`Verifying for Official: ${official.email} (${official.department})`);

        // 1. Verify Dashboard (Active Only)
        const dashboard = await getOfficialDashboard(official._id);
        const dbActiveCount = await Complaint.countDocuments({
            category: official.department,
            currentStatus: { $in: ['Pending', 'In Progress', 'Escalated'] }
        });

        console.log('--- DASHBOARD FEED ---');
        console.log(`Service returned: ${dashboard.length}`);
        console.log(`DB Active Count: ${dbActiveCount}`);

        if (dashboard.length !== dbActiveCount) {
            console.error('MISMATCH: Dashboard feed count does not match active DB records.');
        } else {
            console.log('PASS: Dashboard feed matches active records.');
        }

        // 2. Verify Analytics (All Statuses)
        const analytics = await getDepartmentAnalytics(official._id);
        const dbTotalCount = await Complaint.countDocuments({ category: official.department });

        console.log('--- ANALYTICS ---');
        console.log(`Service Total: ${analytics.total}`);
        console.log(`DB Total Count: ${dbTotalCount}`);
        console.log('Breakdown:', analytics.breakdown);

        if (analytics.total !== dbTotalCount) {
            console.error('MISMATCH: Analytics total does not match DB total.');
        } else {
            console.log('PASS: Analytics totals match.');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verify();
