/**
 * Verification Script
 * Purpose: Verify database integration and status synchronization
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Complaint = require('./src/models/Complaint');
const Vote = require('./src/models/Vote');
const Comment = require('./src/models/Comment');

async function verifyDatabaseIntegration() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Verify Status Distribution
        console.log('📊 STATUS DISTRIBUTION:');
        console.log('━'.repeat(50));
        const statusStats = await Complaint.aggregate([
            { $group: { _id: '$currentStatus', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        statusStats.forEach(stat => {
            console.log(`   ${stat._id.padEnd(15)} : ${stat.count} complaints`);
        });

        // 2. Verify Vote Counts Match
        console.log('\n🗳️  VOTE COUNT VERIFICATION:');
        console.log('━'.repeat(50));
        const complaints = await Complaint.find().limit(5);
        for (const complaint of complaints) {
            const actualVotes = await Vote.countDocuments({ complaint: complaint._id });
            const storedCount = complaint.upvoteCount;
            const match = actualVotes === storedCount ? '✅' : '❌';
            console.log(`   ${match} Complaint ${complaint._id.toString().slice(-6)}: Stored=${storedCount}, Actual=${actualVotes}`);
        }

        // 3. Verify Comment Counts Match
        console.log('\n💬 COMMENT COUNT VERIFICATION:');
        console.log('━'.repeat(50));
        for (const complaint of complaints) {
            const actualComments = await Comment.countDocuments({ complaint: complaint._id, isDeleted: false });
            const storedCount = complaint.commentCount;
            const match = actualComments === storedCount ? '✅' : '❌';
            console.log(`   ${match} Complaint ${complaint._id.toString().slice(-6)}: Stored=${storedCount}, Actual=${actualComments}`);
        }

        // 4. Verify Priority Scores
        console.log('\n⚡ PRIORITY SCORE VERIFICATION:');
        console.log('━'.repeat(50));
        const topPriority = await Complaint.find({ currentStatus: { $in: ['Pending', 'In Progress', 'Escalated'] } })
            .sort({ priorityScore: -1 })
            .limit(5)
            .select('title priorityScore upvoteCount commentCount currentStatus');
        topPriority.forEach((c, i) => {
            console.log(`   ${i + 1}. [${c.priorityScore}] ${c.title.substring(0, 40)}...`);
            console.log(`      Status: ${c.currentStatus} | Upvotes: ${c.upvoteCount} | Comments: ${c.commentCount}`);
        });

        // 5. Verify Status History
        console.log('\n📜 STATUS HISTORY VERIFICATION:');
        console.log('━'.repeat(50));
        const withHistory = await Complaint.findOne({ 'statusHistory.0': { $exists: true } })
            .populate('statusHistory.updatedBy', 'name role');
        if (withHistory) {
            console.log(`   Complaint: ${withHistory.title}`);
            console.log(`   Current Status: ${withHistory.currentStatus}`);
            console.log(`   History (${withHistory.statusHistory.length} entries):`);
            withHistory.statusHistory.slice(0, 3).forEach((h, i) => {
                console.log(`      ${i + 1}. ${h.status} - ${new Date(h.timestamp).toLocaleDateString()}`);
                if (h.remark) console.log(`         Remark: "${h.remark}"`);
            });
        } else {
            console.log('   ⚠️  No complaints with status history found');
        }

        // 6. Summary
        console.log('\n' + '═'.repeat(50));
        console.log('📋 SUMMARY:');
        console.log('═'.repeat(50));
        const total = await Complaint.countDocuments();
        const pending = await Complaint.countDocuments({ currentStatus: 'Pending' });
        const inProgress = await Complaint.countDocuments({ currentStatus: 'In Progress' });
        const resolved = await Complaint.countDocuments({ currentStatus: 'Resolved' });
        const rejected = await Complaint.countDocuments({ currentStatus: 'Rejected' });
        const escalated = await Complaint.countDocuments({ currentStatus: 'Escalated' });
        const submitted = await Complaint.countDocuments({ currentStatus: 'SUBMITTED' });

        console.log(`   Total Complaints: ${total}`);
        console.log(`   Pending: ${pending}`);
        console.log(`   In Progress: ${inProgress}`);
        console.log(`   Resolved: ${resolved}`);
        console.log(`   Rejected: ${rejected}`);
        console.log(`   Escalated: ${escalated}`);
        if (submitted > 0) {
            console.log(`   ⚠️  SUBMITTED (old status): ${submitted} - Run migration!`);
        }

        console.log('\n✨ Verification complete!\n');

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

verifyDatabaseIntegration();
