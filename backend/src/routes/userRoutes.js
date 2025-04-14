const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.use(authController.protect);

// User profile routes
router.get('/me', authController.getMe);
router.patch('/updateMe', authController.updateMe);

// Admin-only routes
router.use(authController.restrictTo('admin'));

// Additional admin routes would go here

module.exports = router; 