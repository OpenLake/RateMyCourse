const express = require('express');
const userAuthMiddleware=require('../middlewares/authUser.middleware')
const adminAuthMiddleware=require('../middlewares/authAdmin.middleware')
const courseController=require('../controllers/course.controller');

const router = express.Router();

// Routes for user authentication
router.post('/addReview', userAuthMiddleware, courseController.addReview);
router.post('/addCourse', adminAuthMiddleware, courseController.addCourse);

module.exports = router;
