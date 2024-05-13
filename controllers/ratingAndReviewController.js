const RatingAndReview = require('../models/ratingAndReviewModel');
const Course = require('../models/courseModel');
const { default: mongoose } = require('mongoose');

exports.createRating = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rating, review, courseId } = req.body;

    const courseDetails = await Course.findOne({
      _id: courseId,
      studentEnrolled: { $elemMatch: { $eq: userId } }
    });

    if (!courseDetails) {
      res.status(404).json({
        status: 'fail',
        message: 'Student is not enrolled in this course '
      });
    }

    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId
    });

    if (alreadyReviewed) {
      res.status(403).json({
        status: 'fail',
        message: 'Course already reviewed by the user'
      });
    }

    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId
    });

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id
        }
      },
      { new: true }
    );

    console.log('Updated course details is :', updatedCourseDetails);

    res.status(200).json({
      status: 'success',
      message: 'Rating and review created successfully',
      data: {
        ratingReview
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while creating rating ',
      data: err.message
    });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const courseId = req.body.courseId;

    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId)
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    if (result.length > 0) {
      res.status(200).json({
        status: 'success',
        averageRating: result[0].averageRating
      });
    }
    res.status(500).json({
      status: 'fail',
      message: 'Average rating is 0, no rating given till now ',
      averageRating: 0
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while fetching average rating',
      data: err.message
    });
  }
};

exports.getAllRating = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: desc })
      .populate({ path: 'user', select: 'firstName LastName email image' })
      .populate({ path: 'course', select: 'courseName' })
      .exec();

    res.status(200).json({
      status: 'success',
      message: 'All reviews fetched successfully',
      data: {
        allReviews
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while fetching all rating and reviews',
      data: err.message
    });
  }
};
