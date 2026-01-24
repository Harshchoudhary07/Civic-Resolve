/**
 * Diagnostic Script
 * Purpose: Check if complaint categories match official departments
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Complaint = require('./src/models/Complaint');
const User = require('./src/models/User');

async function diagnoseCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all unique categories from complaints
        const categories = await Complaint.distinct('category');
        console.log('📋 COMPLAINT CATEGORIES IN DATABASE:');
        console.log('━'.repeat(50));
        for (const category of categories) {
            const count = await Complaint.countDocuments({ category });
            console.log(`   ${category}: ${count} complaints`);
        }

        // Get all officials and their departments
        console.log('\n👮 OFFICIAL DEPARTMENTS:');
        console.log('━'.repeat(50));
        const officials = await User.find({ role: 'official' });
        for (const official of officials) {
            console.log(`   ${official.name}: ${official.department || 'NO DEPARTMENT'}`);
        }

        // Check for mismatches
        console.log('\n⚠️  POTENTIAL ISSUES:');
        console.log('━'.repeat(50));
        const officialDepts = officials.map(o => o.department).filter(d => d);
        const unmatchedCategories = categories.filter(c => !officialDepts.includes(c));
        const unmatchedDepts = officialDepts.filter(d => !categories.includes(d));

        if (unmatchedCategories.length > 0) {
            console.log(`   Categories without officials: ${unmatchedCategories.join(', ')}`);
        }
        if (unmatchedDepts.length > 0) {
            console.log(`   Departments without complaints: ${unmatchedDepts.join(', ')}`);
        }
        if (unmatchedCategories.length === 0 && unmatchedDepts.length === 0) {
            console.log('   ✅ All categories have matching departments!');
        }

        // Show sample complaint
        console.log('\n📄 SAMPLE COMPLAINT:');
        console.log('━'.repeat(50));
        const sample = await Complaint.findOne();
        if (sample) {
            console.log(`   ID: ${sample._id}`);
            console.log(`   Title: ${sample.title}`);
            console.log(`   Category: ${sample.category}`);
            console.log(`   Status: ${sample.currentStatus}`);
            console.log(`   Upvotes: ${sample.upvoteCount}`);
            console.log(`   Comments: ${sample.commentCount}`);
        }

    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

diagnoseCategories();
