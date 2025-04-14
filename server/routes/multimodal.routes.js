const express = require('express');
const router = express.Router();
const multimodalController = require('../controllers/multimodal.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All multimodal routes require authentication
router.use(authenticate);

// @route   POST /api/multimodal/bookings
// @desc    Create a new multi-modal booking
// @access  Private
router.post('/bookings', multimodalController.createMultiModalBooking);

// @route   GET /api/multimodal/bookings
// @desc    Get user's multi-modal bookings
// @access  Private
router.get('/bookings', multimodalController.getMyMultiModalBookings);

// @route   GET /api/multimodal/bookings/:id
// @desc    Get a specific multi-modal booking
// @access  Private
router.get('/bookings/:id', multimodalController.getMultiModalBooking);

// @route   PUT /api/multimodal/:id/payment
// @desc    Process payment for a multi-modal booking
// @access  Private
router.put('/bookings/:id/payment', multimodalController.processPayment);

// @route   PUT /api/multimodal/:id/cancel
// @desc    Cancel a multi-modal booking
// @access  Private
router.put('/bookings/:id/cancel', multimodalController.cancelMultiModalBooking);

module.exports = router;