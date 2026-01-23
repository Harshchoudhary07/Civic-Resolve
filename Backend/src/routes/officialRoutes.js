const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getComplaint,
    updateStatus,
    getAnalytics
} = require('../controllers/officialController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Base Route: /api/official (Assuming mounted in app.js)

// Protect all routes
router.use(protect);
router.use(authorize('official'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/complaints/:id', getComplaint);
router.put('/complaints/:id/status', updateStatus);

module.exports = router;
