const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware=require('../middlewares/authUser.middleware')

const router = express.Router();

// router.get('/',()=>{
//     console.log("hello")
// })
// Routes for user authentication
router.post('/login', authController.loginUser);
router.post('/logout', authMiddleware, authController.logoutUser);

module.exports = router;