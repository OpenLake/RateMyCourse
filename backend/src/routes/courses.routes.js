const express = require('express');
const userAuthMiddleware=require('../middlewares/authUser.middleware')
const adminAuthMiddleware=require('../middlewares/authAdmin.middleware')
const courseController=require('../controllers/course.controller');

const router = express.Router();

// Routes for courses and reviews postings
router.post('/addReview', userAuthMiddleware, courseController.addReview);
router.post('/addCourse', adminAuthMiddleware.authenticateAdmin, courseController.addCourse);

router.get('/getCourses', courseController.getCourses);
router.get('/getIterations', courseController.getIterations);

module.exports = router;
