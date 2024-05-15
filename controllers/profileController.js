const Profile = require('../models/profileModel');
const User = require('../models/userModel');
const { uploadDataToColudinary } = require('../utils/uploadData');

exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = '', about = '', contactNumber, gender } = req.body;

    const id = req.user.id;

    if (!gender) {
      res.status(500).json({
        status: 'fail',
        message: 'All fields are required '
      });
    }

    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById(profileId);

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    profileDetails.gender = gender;

    await profileDetails.save();
    res.status(200).json({
      status: 'success',
      message: 'Your profile has been updated successfully.',
      data: {
        profileDetails
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while updating user profile',
      data: err.message
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id);

    if (!userDetails) {
      return res.status(500).json({
        status: 'fail',
        message: ' User not Found '
      });
    }

    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //unrolled user from all enrolled courses

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      status: 'success',
      message: 'User Deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while deleting user account',
      data: err.message
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    console.log('id  ', id);

    const userDetails = await User.findById(id)
      .populate('additionalDetails')
      .exec();

    res.status(200).json({
      status: 'success',
      message: 'User data fetched successfully',
      data: {
        userDetails
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while fetching user all details',
      data: err.message
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture;
    const userId = req.user.id;
    const image = await uploadDataToColudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    console.log('image data :', image);
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    );
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: {
        updatedProfile
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDetails = await User.findOne({
      _id: userId
    })
      .populate('courses')
      .exec();
    if (!userDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find user with id: ${userDetails}`
      });
    }
    return res.status(200).json({
      success: true,
      data: userDetails.courses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
