const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Profile = require('../models/profileModel');
const User = require('../models/userModel');
const OTP = require('../models/otpModel');

require('dotenv').config();

// send Otp

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body();

    const checkUserPrest = await User.findOne({ email });
    if (checkUserPrest) {
      return res.status(401).json({
        status: 'fail',
        message: 'User is already registered.'
      });
    }

    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false
    });

    console.log('generated Otp : ', otp);

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
      });
      const result = await OTP.findOne({ otp: otp });
    }

    const otpPayLoad = { email, otp };

    const otpBody = await OTP.create(otpPayLoad);

    console.log('otp body ', otpBody);

    res.status(200).json({
      status: 'success',
      data: {
        otp
      }
    });
  } catch (err) {
    console.log('error while creating otp....');
    res.status().json({
      status: 'fail',
      message: err.message
    });
  }
};

//sign up

exports.signUp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp ||
      !contactNumber
    ) {
      res.status(403).json({
        status: 'fail',
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        status: 'fail',
        message:
          'Password and confirmPassword values do not match, please try again.'
      });
    }

    //check user already exist

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        status: 'fail',
        message: 'User is already registered.'
      });
    }

    //find Most recent otp

    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log('most recent otp is a :', recentOtp);

    if (recentOtp.length == 0) {
      res.status(400).json({
        status: 'fail',
        message: 'Otp not found, please try again.'
      });
    } else if (otp != recentOtp.otp) {
      res.status(400).json({
        status: 'fail',
        message: 'Invalid OTP, please try again.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`
    });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    console.log('Error while signing up the user.');
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// login

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(403).json({
        status: 'fail',
        message: 'All fields are required, please try again'
      });
    }

    // user check exist or not
    const user = await User.findOne({ email }).populate('additionalDetails');

    if (!user) {
      res.status(401).json({
        status: 'fail',
        message: 'Users are not registered. Please sign up first'
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        id: user._id,
        email: user.email,
        accountType: user.accountType
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true
      };

      res
        .cookie('token', token, options)
        .status(200)
        .json({
          status: 'success',
          data: {
            token,
            user
          }
        });
    } else {
      res.status(401).json({
        status: 'fail',
        message: 'The password is incorrect.'
      });
    }

    //
  } catch (err) {
    console.log(
      'Error while logging in. Please check your username and password.'
    );
    res.status(500).json({
      status: 'fail',
      message: err.message
    });
  }
};

// change password

exports.changePassword = async (req, res) => {};
