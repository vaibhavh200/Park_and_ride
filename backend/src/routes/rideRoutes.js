const express = require('express');
const rideController = require('../controllers/rideController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/types', rideController.getRideTypes);

// Protected routes
router.use(authController.protect);

// Ride-related routes
router.post('/estimate-fare', rideController.estimateFare);
router.post('/find-drivers', rideController.findAvailableDrivers);
router.post('/book', rideController.bookRide);
router.get('/', rideController.getUserRides);
router.get('/:id', rideController.getRide);
router.patch('/:id/cancel', rideController.cancelRide);
router.patch('/:id/rate', rideController.rateRide);

// Driver-specific routes
router.patch('/:id/status', rideController.updateRideStatus);

// Admin-only routes
router.use(authController.restrictTo('admin'));

// Additional admin routes would go here
// For example, routes to manage ride types, pricing, etc.

module.exports = router; 