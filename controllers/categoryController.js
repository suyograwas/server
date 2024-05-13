const { json } = require('express');
const Category = require('../models/categoryModel');

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({
        status: 'fail',
        message: 'All fields are required'
      });
    }

    const categoryDetails = await Category.create({ name, description });

    console.log('category Details :', categoryDetails);

    res.status(200).json({
      status: 'success',
      message: 'category crated successfully',
      data: {
        categoryDetails
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while creating category',
      data: err.message
    });
  }
};

exports.showAllCategories = async (req, res) => {
  try {
    const allCategory = await Category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      status: 'success',
      message: 'All categories retrieved successfully',
      data: allCategory
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while retrieving all  categories',
      data: err.message
    });
  }
};

exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    const selectedCategory = await Category.findById(categoryId)
      .populate('courses')
      .exec();

    if (!selectedCategory) {
      res.status(500).json({
        status: 'fail',
        message: 'Data Not Found'
      });
    }

    const differentCategories = await Category.find({
      I_id: { $ne: categoryId }
    })
      .populate('courses')
      .exec();

    // top selling course

    res.status(200).json({
      status: 'success',

      data: {
        selectedCategory,
        differentCategories
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while retrieving all  categories',
      data: err.message
    });
  }
};
