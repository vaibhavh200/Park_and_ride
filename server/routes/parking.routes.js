const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parking.controller');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes for parking spots
router.get('/spots', parkingController.getAllParkingSpots);
router.get('/spots/nearby', parkingController.getNearbyParkingSpots);
router.get('/spots/available', parkingController.getAvailableParkingSpots);
router.get('/spots/:id', parkingController.getParkingSpot);
router.get('/spots/:id/availability', parkingController.checkAvailability);

// Public routes for metro stations
router.get('/stations', parkingController.getAllMetroStations);
router.get('/stations/nearby', parkingController.getNearbyMetroStations);
router.get('/stations/:id', parkingController.getMetroStation);

// Admin-only routes for parking spots
router.post('/spots', authenticate, authorizeAdmin, parkingController.createParkingSpot);
router.put('/spots/:id', authenticate, authorizeAdmin, parkingController.updateParkingSpot);
router.delete('/spots/:id', authenticate, authorizeAdmin, parkingController.deleteParkingSpot);

// Admin-only routes for metro stations
router.post('/stations', authenticate, authorizeAdmin, parkingController.createMetroStation);
router.put('/stations/:id', authenticate, authorizeAdmin, parkingController.updateMetroStation);
router.delete('/stations/:id', authenticate, authorizeAdmin, parkingController.deleteMetroStation);

module.exports = router;
