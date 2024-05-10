const { default: mongoose } = require('mongoose');
const { instance } = require('../config/razorpay');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const mailSender = require('../utils/mailSender');
const {
  courseEnrollmentEmail
} = require('../mail/templates/courseEnrollmentEmail');

exports.capturePayments = async (req, res) => {
  try {
    const course_id = req.body;
    const userId = req.user.id;

    if (!course_id) {
      res.status(500).json({
        status: 'fail',
        message: 'Please provide valid course ID'
      });
    }

    let course;
    try {
      course = await Course.findById({ course_id });

      if (!course) {
        res.status(500).json({
          status: 'fail',
          message: 'Could not find the course'
        });
      }

      const uid = new mongoose.Types.ObjectId(userId);

      if (course.studentEnrolled.includes(uid)) {
        res.status(500).json({
          status: 'fail',
          message: 'Student is already enrolled'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'fail',
        message: err.message
      });
    }

    const amount = course.price;
    const currency = 'INR';

    const options = {
      amount: amount * 1000,
      currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        course_id,
        userId
      }
    };

    const paymentResponse = await instance.orders.create(options);

    console.log('payment response :', paymentResponse);

    res.status(200).json({
      status: 'success',
      data: {
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        currency: paymentResponse.currency,
        amount: paymentResponse.amount
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while processing the payment',
      data: err.message
    });
  }
};

exports.verifySignature = async (req, res) => {
  try {
    const webhookSecret = '12345';

    const signature = req.headers['x-razorpay-signature'];

    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (signature === digest) {
      console.log('The payment is authorized');

      const { courseId, userId } = req.body.payload.entity.notes;

      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseId },
        { $push: { studentEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        res.status(500).json({
          status: 'fail',
          message: 'Course Not Found',
          data: err.message
        });
      }

      console.log('enrolled course :', enrolledCourse);

      const enrolledStudent = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $push: { courses: courseId }
        },
        { new: true }
      );

      console.log('enrolled student in course :', enrolledStudent);

      const emailResponse = await mailSender(
        enrolledStudent.email,
        'congratulation from StudyNotion',
        'congratulation ,you are onboarded into new course '
      );
      console.log('email response :', emailResponse);
      res.status(200).json({
        status: 'success',
        message: 'signature verified and Course added successfully'
      });
    }

    res.status(400).json({
      status: 'fail',
      message: 'Invalid request '
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while processing the payment',
      data: err.message
    });
  }
};
