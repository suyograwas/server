const express = require('express');
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseDetails
} = require('../controllers/courseController');

const {
  createCategory,
  categoryPageDetails,
  showAllCategories
} = require('../controllers/categoryController');

const {
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/sectionController');

const {
  createSubSection,
  updateSubSection,
  deleteSubSection
} = require('../controllers/subSectionController');

const {
  createRating,
  getAverageRating,
  getAllRating
} = require('../controllers/ratingAndReviewController');

const {
  auth,
  isInstructor,
  isStudent,
  isAdmin
} = require('../middleware/auth');

router.post('/createCourse', auth, isInstructor, createCourse);
router.post('/addSection', auth, isInstructor, createSection);
router.post('/updateSection', auth, isInstructor, updateSection);
router.post('/deleteSection', auth, isInstructor, deleteSection);
router.post('/updateSubSection', auth, isInstructor, updateSubSection);
router.post('/deleteSubSection', auth, isInstructor, deleteSubSection);
router.post('/addSubSection', auth, isInstructor, createSubSection);
router.get('/getAllCourses', getAllCourses);
router.post('/getCourseDetails', getCourseDetails);

// Put IsAdmin Middleware here
router.post('/createCategory', auth, isAdmin, createCategory);
router.get('/showAllCategories', showAllCategories);
router.post('/getCategoryPageDetails', categoryPageDetails);

router.post('/createRating', auth, isStudent, createRating);
router.get('/getAverageRating', getAverageRating);
router.get('/getReviews', getAllRating);

module.exports = router;
