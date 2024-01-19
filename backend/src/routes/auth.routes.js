const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware=require('../middlewares/authUser.middleware')

const router = express.Router();

// Routes for user authentication
router.post('/register',authController.createUser);
router.post('/login', authController.loginUser);
router.post('/logout', authMiddleware, authController.logoutUser);

module.exports = router;
