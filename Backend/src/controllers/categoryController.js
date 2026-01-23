const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public (or Private if needed)
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return res.status(400).json({ message: 'Category with this name already exists.' });
    }
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
};