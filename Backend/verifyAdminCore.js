const mongoose = require('mongoose');
const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');
const Department = require('./src/models/Department');
const adminService = require('./src/services/adminService');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const runVerification = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // 1. Create Mock Admin
        let admin = await User.findOne({ email: 'admin@civic.com' });
        if (!admin) {
            admin = await User.create({
                name: 'Super Admin',
                email: 'admin@civic.com',
                password: 'password123',
                role: 'admin',
                isActive: true
            });
            console.log('Created Mock Admin');
        }

        // 2. Test User Management (Approve Official)
        // Find or create a pending official
        let pending = await User.findOne({ email: 'pending@official.com' });
        if (!pending) {
            pending = await User.create({
                name: 'Pending Official',
                email: 'pending@official.com',
                password: 'password123',
                role: 'pending_official'
            });
        }

        console.log(`Approving user ${pending._id}...`);
        await adminService.approveOfficial(admin._id, pending._id);
        const approved = await User.findById(pending._id);
        if (approved.role === 'official' && approved.isActive) {
            console.log('PASS: Official Approved');
        } else {
            console.error('FAIL: Approval logic');
        }

        // 3. Test Department Creation and Assignment
        const deptData = { name: 'Test Dept ' + Date.now(), description: 'Temp' };
        await adminService.createDepartment(admin._id, deptData);
        console.log('PASS: Department Created');

        await adminService.assignDepartment(admin._id, pending._id, deptData.name);
        const assigned = await User.findById(pending._id);
        if (assigned.department === deptData.name) {
            console.log('PASS: Department Assigned');
        } else {
            console.error('FAIL: Dept Assignment');
        }

        // 4. Test Analytics
        const stats = await adminService.getSystemAnalytics();
        console.log('System Analytics:', stats);
        if (stats.total >= 0) console.log('PASS: Analytics Fetch');

        process.exit(0);

    } catch (err) {
        console.error('VERIFICATION FAILED:', JSON.stringify(err, null, 2));
        if (err.errors) console.error(err.errors);
        process.exit(1);
    }
};

runVerification();
