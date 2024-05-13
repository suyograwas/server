const jwt = require('jsonwebtoken');
const user = require('../models/userModel');
require('dotenv').config();

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      req.body.auth ||
      req.header('Authorization').replace('Bearer', '');

    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'Token is missing'
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log('decoded jwt :', decode);

      req.user = decode;
    } catch (error) {
      res.status(401).json({
        status: 'fail',
        message: 'The token is invalid',
        data: error.message
      });
    }
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Something went wrong while validating the token',
      data: err.message
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (req.body.accountType !== 'Student') {
      res.status(401).json({
        status: 'fail',
        message: 'This is a protected route for students only'
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: "user's role cannot be verified. Please try again",
      data: err.message
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.body.accountType !== 'Instructor') {
      res.status(401).json({
        status: 'fail',
        message: 'This is a protected route for instructor only'
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: "user's role cannot be verified. Please try again",
      data: err.message
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.body.accountType !== 'Admin') {
      res.status(401).json({
        status: 'fail',
        message: 'This is a protected route for admin only'
      });
    }
    next();
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: "user's role cannot be verified. Please try again",
      data: err.message
    });
  }
};
