const express = require('express');
const userAuthController = require('../controllers/auth.user.controller');
const adminAuthController = require('../controllers/auth.admin.controller');
const userAuthMiddleware=require('../middlewares/authUser.middleware')
const adminAuthMiddleware=require('../middlewares/authAdmin.middleware')

const router = express.Router();

// Routes for user authentication
router.post('/user/register',userAuthController.createUser);
router.post('/user/login', userAuthController.loginUser);
router.post('/user/logout', userAuthMiddleware, userAuthController.logoutUser);

// Routes for admin authentication
router.post('/admin/register',adminAuthController.createAdmin);
router.post('/admin/login', adminAuthController.loginAdmin);
router.post('/admin/logout', adminAuthMiddleware, adminAuthController.logoutAdmin);

module.exports = router;
