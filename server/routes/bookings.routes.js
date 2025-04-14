const express = require('express');
const router = express.Router();
const bookingsController = require('../controllers/bookings.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Protect all routes
router.use(authenticate);

// User routes
router.get('/my-bookings', bookingsController.getMyBookings);
router.get('/by-code/:code', bookingsController.getBookingByCode);
router.get('/:id/receipt', bookingsController.generateReceipt);
router.post('/', bookingsController.createBooking);
router.get('/:id', bookingsController.getBooking);
router.put('/:id/cancel', bookingsController.cancelBooking);
router.put('/:id/modify', bookingsController.modifyBooking);
router.put('/:id/payment', bookingsController.processPayment);
router.put('/:id/check-in', bookingsController.checkIn);
router.put('/:id/check-out', bookingsController.checkOut);
router.put('/:id/request-extension', bookingsController.requestExtension);
router.post('/lpr-check-in', bookingsController.lprCheckIn);
router.post('/rfid-check-in', bookingsController.rfidCheckIn);
router.get('/vehicle/:registrationNumber', bookingsController.getBookingByVehicle);
router.get('/status/:status', bookingsController.getBookingsByStatus);

// Admin routes
router.get('/', authorizeAdmin, bookingsController.getAllBookings);
router.put('/:id/approve-extension', authorizeAdmin, bookingsController.approveExtension);
router.put('/:id/assign-spot', authorizeAdmin, bookingsController.assignSpot);

module.exports = router;
