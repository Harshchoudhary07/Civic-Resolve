const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Default categories to be inserted
const categories = [
    { name: 'Roads & Infrastructure', description: 'Issues related to roads, bridges, streetlights.' },
    { name: 'Water Supply', description: 'Problems with water availability, quality, or leaks.' },
    { name: 'Sanitation & Garbage', description: 'Waste collection issues, public cleanliness.' },
    { name: 'Electricity', description: 'Power outages, faulty lines, or billing issues.' },
    { name: 'Public Safety', description: 'Concerns related to law and order or public hazards.' },
    { name: 'Parks & Recreation', description: 'Issues in public parks, playgrounds, or recreational facilities.' },
    { name: 'Other', description: 'For any other issues not listed.' },
];

// Import data into DB
const importData = async () => {
  try {
    await Category.deleteMany(); // Clear existing categories to prevent duplicates
    await Category.insertMany(categories);
    console.log('✅ Default categories have been imported successfully!');
    process.exit();
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    await Category.deleteMany();
    console.log('🔥 All category data has been destroyed.');
    process.exit();
  } catch (err) {
    console.error('Error deleting data:', err);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}