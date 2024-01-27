const express = require('express');
const authMiddleware=require('../middlewares/authUser.middleware')
const courseController=require('../controllers/course.controller');

const router = express.Router();

// Routes for user authentication
router.post('/addCourse', authMiddleware, courseController.addCourseReview);

module.exports = router;
