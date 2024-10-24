const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); 
const router = express.Router();

// Signup Route
router.post('/signup', authController.signup);

// Signin Route
router.post('/signin', authController.signin);

// Refresh Token Route
router.post('/refresh-token', authController.refreshToken);

// Logout Route
router.post('/logout', authController.logout);

module.exports = router;
