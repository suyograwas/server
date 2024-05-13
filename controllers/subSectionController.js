const SubSection = require('../models/subSectionModel');
const Section = require('../models/sectionModel');
const { uploadDataToCloudinary } = require('../utils/uplaodData');
require('dotenv').config();

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, timeDuration, description } = req.body;

    const video = req.file.videoFile;

    if (!sectionId || !title || !timeDuration || !description || !video) {
      res.status(500).json({
        status: 'fail',
        message: 'All fields are required'
      });
    }

    const uploadDetails = await uploadDataToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    const subsectionDetails = await SubSection.create({
      title,
      timeDuration,
      description,
      videoUrl: uploadDetails.secure_url
    });

    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        $push: {
          subSection: subsectionDetails._id
        }
      },
      { new: true }
    )
      .populate('SubSection')
      .exec();

    res.status(200).json({
      status: 'success',
      message: 'Sub section created successfully',
      data: {
        updatedSection
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while creating sub section',
      data: err.message
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { sectionId, title, description } = req.body;
    const subSection = await SubSection.findById(sectionId);

    if (!subSection) {
      return res.status(404).json({
        success: false,
        message: 'SubSection not found'
      });
    }

    if (title !== undefined) {
      subSection.title = title;
    }

    if (description !== undefined) {
      subSection.description = description;
    }
    if (req.files && req.files.video !== undefined) {
      const video = req.files.video;
      const uploadDetails = await uploadImageToCloudinary(
        video,
        process.env.FOLDER_NAME
      );
      subSection.videoUrl = uploadDetails.secure_url;
      subSection.timeDuration = `${uploadDetails.duration}`;
    }

    await subSection.save();

    return res.json({
      success: true,
      message: 'Section updated successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while updating the section'
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId, sectionId } = req.body;
    await Section.findByIdAndUpdate(
      { _id: sectionId },
      {
        $pull: {
          subSection: subSectionId
        }
      }
    );
    const subSection = await SubSection.findByIdAndDelete({
      _id: subSectionId
    });

    if (!subSection) {
      return res
        .status(404)
        .json({ success: false, message: 'SubSection not found' });
    }

    return res.json({
      success: true,
      message: 'SubSection deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the SubSection'
    });
  }
};
