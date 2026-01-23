const dotenv = require('dotenv');
// Load env vars
dotenv.config();
const express = require('express');
const path = require('path'); // Add this line



const app = require('./app');
const connectDB = require('./config/db');



// Connect to database
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
