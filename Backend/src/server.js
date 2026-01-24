const dotenv = require('dotenv');
// Load env vars
dotenv.config();
const express = require('express');
const http = require('http');
const path = require('path');

const app = require('./app');
const connectDB = require('./config/db');
const { initializeSocket } = require('./config/socket');

// Connect to database
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize Socket.IO
  initializeSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`🔌 Socket.IO ready for real-time connections`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});
