const mongoose = require('mongoose');
const Complaint = require('./src/models/Complaint');
require('dotenv').config();

const MONGO_URI = 'mongodb+srv://sau24082004:Saurabh1234@cluster0.rph06.mongodb.net/civic-resolve?retryWrites=true&w=majority&appName=Cluster0';

const verify = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to:', mongoose.connection.name);
        console.log('Host:', mongoose.connection.host);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const count = await Complaint.countDocuments();
        console.log('Complaint count:', count);

        if (count > 0) {
            const sample = await Complaint.findOne();
            console.log('Sample complaint:', sample);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verify();
