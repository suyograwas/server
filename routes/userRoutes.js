const express = require('express');
const router = express.Router();

const {
  login,
  signUp,
  sendOTP,
  changePassword
} = require('../controllers/authController');

const {
  resetPasswordToken,
  resetPassword
} = require('../controllers/resetPasswordController');

const { auth } = require('../middleware/auth');

router.post('/login', login);
router.post('/signup', signUp);
router.post('/sendotp', sendOTP);

router.post('/changepassword', auth, changePassword);

router.post('/reset-password-token', resetPasswordToken);

router.post('/reset-password', resetPassword);

module.exports = router;
