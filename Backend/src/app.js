const express = require('express');
const cors = require('cors');
const path = require('path'); // Add this line
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const citizenRoutes = require('./routes/citizenRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const feedRoutes = require('./routes/feedRoutes');

const app = express();
const cloudinary = require('cloudinary').v2;

// Middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Configure CORS to allow your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Replace with your actual frontend URL in production
  credentials: true,
}));
// Configure Helmet with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://accounts.google.com/gsi/client"],
      frameSrc: ["'self'", "https://accounts.google.com/gsi/"],
      connectSrc: ["'self'", "https://accounts.google.com/gsi/"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com/gsi/style"],
    },
  },
}));

// Cloudinary Configuration - Add these console logs for debugging
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/feed', feedRoutes);

// Health Check
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Complaint Redressal System API is running' });
});

console.log('__dirname:', __dirname);
console.log('Resolved FE path:', path.resolve(__dirname, '..', '..', 'Frontend', 'dist'));


// Serve Frontend in production
if (process.env.NODE_ENV === 'production') {
  const feBuildPath = path.join(process.cwd(), 'Frontend', 'dist');

  console.log('Serving frontend from:', feBuildPath);

  app.use(express.static(feBuildPath));

  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(feBuildPath, 'index.html'));
  });
}



// Error Handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
