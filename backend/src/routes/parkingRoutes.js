const express = require('express');
const parkingController = require('../controllers/parkingController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/lots', parkingController.getAllParkingLots);
router.get('/lots/:id', parkingController.getParkingLot);
router.get('/nearby', parkingController.findNearbyParkingLots);

// Protected routes
router.use(authController.protect);

// Parking availability and booking
router.post('/check-availability', parkingController.checkAvailability);
router.post('/bookings', parkingController.createBooking);
router.get('/bookings', parkingController.getUserBookings);
router.get('/bookings/:id', parkingController.getBooking);
router.patch('/bookings/:id/cancel', parkingController.cancelBooking);

// Check-in and check-out
router.post('/check-in', parkingController.checkIn);
router.post('/check-out', parkingController.checkOut);

// Admin-only routes
router.use(authController.restrictTo('admin'));

// Additional admin routes would go here
// For example, routes to manage parking lots, add/remove parking spots, etc.

module.exports = router; 