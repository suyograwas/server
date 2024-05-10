const Course = require('../models/courseModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const { uploadDataToColudinary } = require('../utils/imageUploader');

const createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category
    } = req.body;

    const thumbnail = req.files.thumbnailImage;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !category ||
      !thumbnail ||
      !tag
    ) {
      res.status(400).json({
        status: 'fail',
        message: 'All fields are required'
      });
    }

    const userId = req.user.id;
    const instructorDetails = await User.findById({ userId });
    console.log('instructor Details are :', instructorDetails);

    if (!instructorDetails) {
      res.status(400).json({
        status: 'fail',
        message: 'Instructor details are not found'
      });
    }

    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      res.status(400).json({
        status: 'fail',
        message: 'Category details are not found'
      });
    }

    const thumbnailImage = await uploadDataToColudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url
    });

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );

    // update Tags Schema
    //homeWork

    res.status(200).json({
      status: 'success',
      message: 'Course Created Successfully',
      data: { newCourse }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Failed to create a course',
      data: err.message
    });
  }
};

const showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find();
    // const allCourses = await Course.find(
    //   {},
    //   {
    //     courseName: true,
    //     price: true,
    //     thumbnail: true,
    //     instructor: true,
    //     ratingAndReviews: true,
    //     studentEnrolled: true
    //   }
    // )
    //   .populate('instructor')
    //   .exec();

    res.status(200).json({
      status: 'success',
      message: 'All course data has been successfully fetched',
      data: {
        allCourses
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while fetching all courses',
      data: err.message
    });
  }
};
