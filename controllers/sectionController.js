const Section = require('../models/sectionModel');
const Course = require('../models/courseModel');

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;

    if (!sectionName || !courseId) {
      res.status(500).res({
        status: 'fail',
        message: 'CourseID or section name is missing'
      });
    }

    const newSection = await Section.create({ sectionName });

    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id
        }
      },
      {
        new: true
      }
    );

    //use populate to replace section and subsection both in updatedCourseDetails

    res.status(200).json({
      status: 'success',
      message: 'section is created successfully',
      data: {
        updatedCourseDetails
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while creating section',
      data: err.message
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId } = req.body;

    if (!sectionName || !sectionId) {
      res.status(500).res({
        status: 'fail',
        message: 'SectionID or section name is missing'
      });
    }

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'section is updated successfully',
      data: {
        section
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while updating section',
      data: err.message
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    await Section.findByIdAndDelete({ sectionId });
    // also delete the section id from course id
    res.status(200).json({
      status: 'success',
      message: 'section is deleted  successfully'
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: 'Something went wrong while deleting section',
      data: err.message
    });
  }
};
