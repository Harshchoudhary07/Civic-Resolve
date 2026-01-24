/**
 * Fix Department Matching Script
 * Purpose: Update official departments to match complaint categories exactly
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');

async function fixDepartments() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all unique categories
        const categories = await Complaint.distinct('category');
        console.log('📋 Available Categories:');
        categories.forEach((cat, i) => console.log(`   ${i + 1}. "${cat}"`));

        // Get all officials
        const officials = await User.find({ role: 'official' });
        console.log(`\n👮 Found ${officials.length} officials\n`);

        for (const official of officials) {
            console.log(`Official: ${official.name}`);
            console.log(`  Current Department: "${official.department || 'NONE'}"`);

            // If department doesn't match any category, update it
            if (!categories.includes(official.department)) {
                // Assign to first available category
                if (categories.length > 0) {
                    official.department = categories[0];
                    await official.save();
                    console.log(`  ✅ Updated to: "${official.department}"`);
                } else {
                    console.log(`  ⚠️  No categories available to assign`);
                }
            } else {
                console.log(`  ✅ Department matches a category`);
            }
            console.log('');
        }

        // Verify the fix
        console.log('\n📊 VERIFICATION:');
        console.log('━'.repeat(50));
        for (const category of categories) {
            const count = await Complaint.countDocuments({ category });
            const officialCount = await User.countDocuments({ role: 'official', department: category });
            console.log(`   ${category}:`);
            console.log(`     - Complaints: ${count}`);
            console.log(`     - Officials: ${officialCount}`);
        }

    } catch (error) {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

fixDepartments();
