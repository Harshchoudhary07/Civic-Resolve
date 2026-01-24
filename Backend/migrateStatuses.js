/**
 * Database Migration Script
 * Purpose: Update all existing complaints with SUBMITTED status to Pending
 * Run this once after deploying the status enum changes
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Complaint = require('./src/models/Complaint');

async function migrateComplaintStatuses() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find all complaints with SUBMITTED status
        const result = await Complaint.updateMany(
            { currentStatus: 'SUBMITTED' },
            { $set: { currentStatus: 'Pending' } }
        );

        console.log(`✅ Migration completed successfully!`);
        console.log(`   - Matched: ${result.matchedCount} complaints`);
        console.log(`   - Modified: ${result.modifiedCount} complaints`);

        // Verify the migration
        const submittedCount = await Complaint.countDocuments({ currentStatus: 'SUBMITTED' });
        const pendingCount = await Complaint.countDocuments({ currentStatus: 'Pending' });

        console.log(`\n📊 Post-migration status:`);
        console.log(`   - SUBMITTED complaints remaining: ${submittedCount}`);
        console.log(`   - Pending complaints: ${pendingCount}`);

        if (submittedCount === 0) {
            console.log('\n✨ All complaints successfully migrated!');
        } else {
            console.log('\n⚠️  Warning: Some SUBMITTED complaints still exist');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the migration
migrateComplaintStatuses();
