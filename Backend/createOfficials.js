/**
 * Create Officials for All Departments
 * Purpose: Create an official user for each complaint category
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');

async function createOfficials() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all unique categories from complaints
        const categories = await Complaint.distinct('category');
        console.log(`📋 Found ${categories.length} unique categories:\n`);
        categories.forEach((cat, i) => console.log(`   ${i + 1}. ${cat}`));

        console.log('\n👮 Creating/Updating Officials...\n');

        for (const category of categories) {
            // Create a safe email from category name
            const emailSafe = category.toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .substring(0, 20);

            const email = `${emailSafe}@civic.gov`;
            const name = `${category} Officer`;
            const password = 'Official@123'; // Default password

            // Check if official already exists for this department
            let official = await User.findOne({ department: category, role: 'official' });

            if (official) {
                console.log(`   ✅ Official already exists for ${category}`);
                console.log(`      Email: ${official.email}`);
            } else {
                // Check if email exists
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                    // Update existing user to be official for this department
                    existingUser.role = 'official';
                    existingUser.department = category;
                    existingUser.isActive = true;
                    await existingUser.save();
                    console.log(`   ✅ Updated existing user for ${category}`);
                    console.log(`      Email: ${email}`);
                } else {
                    // Create new official
                    official = await User.create({
                        name,
                        email,
                        password,
                        role: 'official',
                        department: category,
                        isActive: true,
                        authProvider: 'local'
                    });
                    console.log(`   ✅ Created new official for ${category}`);
                    console.log(`      Email: ${email}`);
                    console.log(`      Password: ${password}`);
                }
            }
        }

        // Verification
        console.log('\n📊 VERIFICATION:');
        console.log('━'.repeat(60));
        console.log('Category'.padEnd(30) + 'Complaints'.padEnd(15) + 'Officials');
        console.log('━'.repeat(60));

        for (const category of categories) {
            const complaintCount = await Complaint.countDocuments({ category });
            const officialCount = await User.countDocuments({ role: 'official', department: category });
            console.log(
                category.padEnd(30) +
                complaintCount.toString().padEnd(15) +
                officialCount.toString()
            );
        }

        console.log('\n✨ All officials created successfully!');
        console.log('\n📝 Login Credentials (all officials):');
        console.log('   Password: Official@123');
        console.log('   Emails: <category>@civic.gov (e.g., roadsinfrastructure@civic.gov)');

    } catch (error) {
        console.error('❌ Failed to create officials:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

createOfficials();
