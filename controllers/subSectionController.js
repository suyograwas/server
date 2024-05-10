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

// update sub section

// delete sub section
