const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60
  }
});

async function sendVerificationMail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      'Verification Email from StudyNotion'
    );

    console.log('Email Send successfully', mailResponse);
  } catch (err) {
    console.log('Error occurred while sending mails :', err);
    throw err;
  }
}

otpSchema.pre('save', async function(next) {
  await sendVerificationMail(this.mail, this.otp);
  next();
});

module.exports = mongoose.model('OTP', otpSchema);
