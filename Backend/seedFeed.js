const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Complaint = require('../src/models/Complaint');
const Vote = require('../src/models/Vote');
const Comment = require('../src/models/Comment');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Create a dummy user if not exists
        let user = await User.findOne({ email: 'seed@example.com' });
        if (!user) {
            user = await User.create({
                name: 'Seed User',
                email: 'seed@example.com',
                password: 'password123',
                role: 'citizen',
                isActive: true,
                authProvider: 'local'
            });
            console.log('Created seed user');
        }

        // Create 3 Complaints
        const complaints = [
            {
                title: 'Broken Streetlight on 5th Avenue',
                description: 'The streetlight has been flickering for weeks and is now completely out. It is very dark and dangerous at night.',
                category: 'Streetlight',
                user: user._id,
                location: { sourceType: 'MANUAL', address: '5th Avenue, Indiranagar' },
                currentStatus: 'Pending',
                upvoteCount: 15,
                commentCount: 2,
                priorityScore: 95 // 15*5 + 2*10
            },
            {
                title: 'Garbage Pileup near Park',
                description: 'Trash has not been collected for 3 days. It smells terrible and is attracting strays.',
                category: 'Garbage',
                user: user._id,
                location: { sourceType: 'MANUAL', address: 'Central Park Gate 2' },
                currentStatus: 'In Progress',
                upvoteCount: 42,
                commentCount: 5,
                priorityScore: 312 // (42*5 + 5*10) * 1.2
            },
            {
                title: 'Pothole Causing Traffic',
                description: 'Massive pothole in the middle of the junction.',
                category: 'Road',
                user: user._id,
                location: { sourceType: 'MANUAL', address: 'MG Road Junction' },
                currentStatus: 'Resolved',
                upvoteCount: 10,
                commentCount: 1,
                priorityScore: 0 // Resolved = 0
            }
        ];

        await Complaint.deleteMany({ user: user._id }); // Clean up old seed data
        await Complaint.insertMany(complaints);

        console.log('Seeded 3 complaints');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seed();
