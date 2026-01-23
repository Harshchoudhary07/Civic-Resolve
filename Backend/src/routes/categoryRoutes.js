const express = require('express');
const router = express.Router();
const { getCategories, createCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// GET /api/categories - Get all categories (publicly accessible for dropdowns)
// POST /api/categories - Create a new category (admin only)
router.route('/')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

module.exports = router;