const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const User = require('./src/models/User');
const Complaint = require('./src/models/Complaint');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

const cleanObjectId = (str) => {
    if (!str) return null;
    // Remove ObjectId(" and ") wrapper if present
    let clean = str.replace(/ObjectId\("/g, '').replace(/"\)/g, '');
    // Remove quotes if they persist
    clean = clean.replace(/"/g, '');
    return clean.trim();
};

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB. DB Name:', mongoose.connection.name);

        const results = [];
        fs.createReadStream('../database.csv')
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`CSV Parsing complete. Rows found: ${results.length}`);

                // Debug first row
                if (results.length > 0) {
                    console.log('Sample Row Raw _id:', results[0]._id);
                    console.log('Sample Row Cleaned _id:', cleanObjectId(results[0]._id));
                }

                let successCount = 0;
                let errorCount = 0;

                for (const row of results) {
                    try {
                        const userId = cleanObjectId(row.user);
                        const complaintId = cleanObjectId(row._id);

                        if (!userId || !complaintId) {
                            console.log(`Skipping row due to missing ID. User: ${userId}, Post: ${complaintId}`);
                            continue;
                        }

                        // 1. Ensure User
                        let user = await User.findById(userId);
                        if (!user) {
                            user = await User.create({
                                _id: userId,
                                name: 'Citizen ' + userId.substring(userId.length - 4),
                                email: `user${userId.substring(userId.length - 4)}_${Date.now()}@example.com`,
                                password: 'password123',
                                role: 'citizen',
                                isActive: true,
                                authProvider: 'local'
                            });
                        }

                        // 2. Prepare Data
                        const complaintData = {
                            title: row.title,
                            description: row.description,
                            category: row.category,
                            user: userId,
                            currentStatus: row.currentStatus === 'SUBMITTED' ? 'Pending' :
                                row.currentStatus === 'IN_PROGRESS' ? 'In Progress' :
                                    row.currentStatus === 'RESOLVED' ? 'Resolved' : row.currentStatus,
                            location: {
                                sourceType: 'MANUAL',
                                address: row.location_text || 'Unknown Location'
                            },
                            attachments: row.attachments ? [{
                                url: row.attachments,
                                mediaType: 'image',
                                uploadedAt: new Date()
                            }] : [],
                            createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
                            updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),

                            // Metrics
                            upvoteCount: Math.floor(Math.random() * 50),
                            commentCount: Math.floor(Math.random() * 10),
                            priorityScore: 0 // Will recalc below
                        };

                        // Calculate Score
                        let score = (complaintData.upvoteCount * 5) + (complaintData.commentCount * 10);
                        if (complaintData.currentStatus === 'In Progress') score *= 1.2;
                        if (complaintData.currentStatus === 'Resolved') score = 0;
                        complaintData.priorityScore = Math.round(score);

                        // 3. Upsert
                        await Complaint.findByIdAndUpdate(complaintId, complaintData, { upsert: true, new: true });
                        successCount++;
                        process.stdout.write('+');

                    } catch (err) {
                        errorCount++;
                        console.error(`\nError on row '${row.title}':`, err.message);
                    }
                }

                console.log(`\nImport Summary: Success=${successCount}, Errors=${errorCount}`);
                process.exit(0);
            });

    } catch (error) {
        console.error('Fatal Error:', error);
        process.exit(1);
    }
};

importData();
