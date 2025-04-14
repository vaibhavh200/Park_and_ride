const express = require('express');
const router = express.Router();
const ridesController = require('../controllers/rides.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes
router.get('/services', ridesController.getAllRideServices);
router.get('/services/:id', ridesController.getRideService);
router.get('/services/type/:type', ridesController.getRideServicesByType);
router.get('/services/station/:stationId', ridesController.getRideServicesByStation);

// Private routes - require authentication
router.use(authenticate);

// Ride bookings
router.post('/bookings', ridesController.createRideBooking);
router.get('/bookings/my-bookings', ridesController.getMyRideBookings);
router.get('/bookings/:id', ridesController.getRideBooking);
router.put('/bookings/:id/cancel', ridesController.cancelRideBooking);
router.put('/bookings/:id/feedback', ridesController.submitRideFeedback);

// Admin routes for ride services
router.post('/services', authenticate, authorizeAdmin, ridesController.createRideService);
router.put('/services/:id', authenticate, authorizeAdmin, ridesController.updateRideService);
router.delete('/services/:id', authenticate, authorizeAdmin, ridesController.deleteRideService);

// Admin routes for ride bookings
router.get('/bookings', authenticate, authorizeAdmin, ridesController.getAllRideBookings);

module.exports = router;
