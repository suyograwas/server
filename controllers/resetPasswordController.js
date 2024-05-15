const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/userModel');
const mailSender = require('../utils/mailSender');
require('dotenv').config();

exports.resetPasswordToken = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(404).json({
        status: 'fail',
        message: 'Users are not registered. Please sign up first'
      });
    }

    const token = crypto.randomBytes(20).toString('hex');

    const updateDetails = await User.findOneAndUpdate(
      { email },
      { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );

    const url = `http://localhost:3000/update-passowrd/${token}`;

    await mailSender(email, 'Password Reset Link', `Password Rest Link:${url}`);

    res.status(200).json({
      status: 'success',
      message:
        'Email send successfully, Please check your email and change password '
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while sending the reset password email',
      data: err.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password != confirmPassword) {
      res.status(500).json({
        status: 'fail',
        message: 'The password does not match.'
      });
    }

    const userDetails = User.findOne({ token });

    if (!userDetails) {
      res.status(404).json({
        status: 'fail',
        message: 'The token is invalid.'
      });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      res.status(505).json({
        status: 'fail',
        message:
          'Your token has expired. Please regenerate your reset password token.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { token },
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Password reset successful'
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while resetting the password',
      data: err.message
    });
  }
};
