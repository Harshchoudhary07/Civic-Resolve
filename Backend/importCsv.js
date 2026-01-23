const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const cleanObjectId = (str) => {
    if (!str) return null;
    return str.replace(/ObjectId\("|"\)/g, '');
};

const calculatePriorityScore = (upvoteCount, commentCount, status) => {
    let score = (upvoteCount * 5) + (commentCount * 10);
    if (status === 'In Progress' || status === 'IN_PROGRESS') {
        status = 'In Progress'; // Normalize
        score *= 1.2;
    } else if (status === 'Resolved' || status === 'RESOLVED') {
        status = 'Resolved';
        score = 0;
    }
    return Math.round(score);
};

const normalizeStatus = (status) => {
    const map = {
        'SUBMITTED': 'Pending', // Default map submitted to pending if that's the flow, or keep as Submitted if enum allows
        'IN_PROGRESS': 'In Progress',
        'RESOLVED': 'Resolved'
    };
    return map[status] || status; // Fallback to original if not in map
};

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const results = [];

        fs.createReadStream('database.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`Parsed ${results.length} rows`);

                for (const row of results) {
                    const userId = cleanObjectId(row.user);
                    const complaintId = cleanObjectId(row._id);

                    // 1. Ensure User Exists
                    let user = await User.findById(userId);
                    if (!user) {
                        console.log(`Creating dummy user for ID: ${userId}`);
                        user = await User.create({
                            _id: userId,
                            name: `Citizen ${userId.slice(-4)}`,
                            email: `citizen${userId.slice(-4)}@example.com`,
                            password: 'password123', // Dummy password
                            role: 'citizen',
                            isActive: true,
                            authProvider: 'local'
                        });
                    }

                    // 2. Prepare Complaint Data
                    // Randomize engagement for the feed lookup
                    const upvoteCount = Math.floor(Math.random() * 50);
                    const commentCount = Math.floor(Math.random() * 10);
                    const status = normalizeStatus(row.currentStatus);
                    const priorityScore = calculatePriorityScore(upvoteCount, commentCount, status);

                    const complaintData = {
                        _id: complaintId,
                        title: row.title,
                        description: row.description,
                        category: row.category,
                        user: userId,
                        currentStatus: status,
                        location: {
                            sourceType: 'MANUAL',
                            address: row.location_text
                        },
                        attachments: row.attachments ? [{
                            url: row.attachments,
                            mediaType: 'image', // Assumption based on CSV content
                            uploadedAt: new Date()
                        }] : [],
                        createdAt: new Date(row.createdAt),
                        updatedAt: new Date(row.updatedAt),
                        upvoteCount,
                        commentCount,
                        priorityScore
                    };

                    // 3. Upsert Complaint
                    await Complaint.findByIdAndUpdate(complaintId, complaintData, { upsert: true, new: true });
                    process.stdout.write('.');
                }

                console.log('\nImport complete!');
                process.exit(0);
            });

    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
};

importData();
