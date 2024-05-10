const Profile = require('../models/profileModel');
const User = require('../models/userModel');

exports.updateProfile = async (req, res) => {
  try {
    const { dateOfBirth = '', about = '', contactNumber, gender } = req.body;

    const id = req.user.id;

    if (!contactNumber || !gender) {
      res.status(500).json({
        status: 'fail',
        message: 'All fields are required '
      });
    }

    const userDetails = await User.findById({ id });
    const profileId = userDetails.additionalDetails;
    const profileDetails = await Profile.findById({ profileId });

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

const deleteAccount = async (req, res) => {
  try {
    const id = req.body.id;
    const userDetails = await User.findById(id);

    if (!userDetails) {
      res.status(500).json({
        status: 'fail',
        message: ' User not Found '
      });
    }

    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    //unrolled user from all enrolled courses

    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'User Deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while deleting user account',
      data: err.message
    });
  }
};

const getAllUserDetails = async (req, res) => {
  try {
    const id = req.body.id;

    const userDetails = await User.findById(id)
      .populate('AdditionalDetails')
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
