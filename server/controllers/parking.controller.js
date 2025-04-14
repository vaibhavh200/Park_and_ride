const ParkingSpot = require('../models/ParkingSpot');
const MetroStation = require('../models/MetroStation');
const ParkingBooking = require('../models/ParkingBooking');

/**
 * @desc    Get all parking spots
 * @route   GET /api/parking/spots
 * @access  Public
 */
exports.getAllParkingSpots = async (req, res) => {
  try {
    const { metroStation, type, amenities, minAvailable } = req.query;
    
    // Build query
    const query = {};
    
    if (metroStation) {
      query.metroStation = metroStation;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (amenities) {
      query.amenities = { $in: amenities.split(',') };
    }
    
    if (minAvailable) {
      query.availableSpots = { $gte: parseInt(minAvailable) };
    }
    
    // Only active parking spots
    query.active = true;
    
    const parkingSpots = await ParkingSpot.find(query)
      .populate('metroStation', 'name code');
    
    res.status(200).json({
      success: true,
      count: parkingSpots.length,
      data: parkingSpots
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get parking spots near a location
 * @route   GET /api/parking/spots/nearby
 * @access  Public
 */
exports.getNearbyParkingSpots = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude coordinates'
      });
    }
    
    const parkingSpots = await ParkingSpot.findNearby(
      parseFloat(longitude),
      parseFloat(latitude),
      maxDistance ? parseInt(maxDistance) : 5000
    );
    
    res.status(200).json({
      success: true,
      count: parkingSpots.length,
      data: parkingSpots
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get single parking spot
 * @route   GET /api/parking/spots/:id
 * @access  Public
 */
exports.getParkingSpot = async (req, res) => {
  try {
    const parkingSpot = await ParkingSpot.findById(req.params.id)
      .populate('metroStation');
    
    if (!parkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: parkingSpot
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Create new parking spot
 * @route   POST /api/parking/spots
 * @access  Private/Admin
 */
exports.createParkingSpot = async (req, res) => {
  try {
    // Create parking spot
    const parkingSpot = await ParkingSpot.create(req.body);
    
    // Update metro station if needed
    await MetroStation.findByIdAndUpdate(
      req.body.metroStation,
      { hasParking: true }
    );
    
    res.status(201).json({
      success: true,
      data: parkingSpot
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Update parking spot
 * @route   PUT /api/parking/spots/:id
 * @access  Private/Admin
 */
exports.updateParkingSpot = async (req, res) => {
  try {
    const parkingSpot = await ParkingSpot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!parkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: parkingSpot
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Delete parking spot
 * @route   DELETE /api/parking/spots/:id
 * @access  Private/Admin
 */
exports.deleteParkingSpot = async (req, res) => {
  try {
    const parkingSpot = await ParkingSpot.findById(req.params.id);
    
    if (!parkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    // Check if there are any active bookings
    const activeBookings = await ParkingBooking.countDocuments({
      parkingSpot: req.params.id,
      status: { $in: ['booked', 'checked-in'] }
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parking spot with active bookings'
      });
    }
    
    await parkingSpot.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Check parking spot availability for a time range
 * @route   GET /api/parking/spots/:id/availability
 * @access  Public
 */
exports.checkAvailability = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide startTime and endTime'
      });
    }
    
    const parkingSpot = await ParkingSpot.findById(req.params.id);
    
    if (!parkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    // Count overlapping bookings
    const overlappingBookings = await ParkingBooking.countDocuments({
      parkingSpot: req.params.id,
      status: { $in: ['booked', 'checked-in'] },
      $or: [
        { 
          startTime: { $lte: new Date(endTime) },
          endTime: { $gte: new Date(startTime) }
        }
      ]
    });
    
    const isAvailable = parkingSpot.availableSpots > overlappingBookings;
    const spotsAvailable = Math.max(0, parkingSpot.availableSpots - overlappingBookings);
    
    res.status(200).json({
      success: true,
      data: {
        isAvailable,
        totalSpots: parkingSpot.totalSpots,
        availableSpots: parkingSpot.availableSpots,
        spotsAvailable,
        overlappingBookings
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get all metro stations
 * @route   GET /api/parking/stations
 * @access  Public
 */
exports.getAllMetroStations = async (req, res) => {
  try {
    const { hasParking, hasLastMileConnectivity, line } = req.query;
    
    // Build query
    const query = {};
    
    if (hasParking) {
      query.hasParking = hasParking === 'true';
    }
    
    if (hasLastMileConnectivity) {
      query.hasLastMileConnectivity = hasLastMileConnectivity === 'true';
    }
    
    if (line) {
      query.lines = line;
    }
    
    // Only active stations
    query.active = true;
    
    const metroStations = await MetroStation.find(query);
    
    res.status(200).json({
      success: true,
      count: metroStations.length,
      data: metroStations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get metro stations near a location
 * @route   GET /api/parking/stations/nearby
 * @access  Public
 */
exports.getNearbyMetroStations = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.query;
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude coordinates'
      });
    }
    
    const metroStations = await MetroStation.findNearby(
      parseFloat(longitude),
      parseFloat(latitude),
      maxDistance ? parseInt(maxDistance) : 5000
    );
    
    res.status(200).json({
      success: true,
      count: metroStations.length,
      data: metroStations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get single metro station
 * @route   GET /api/parking/stations/:id
 * @access  Public
 */
exports.getMetroStation = async (req, res) => {
  try {
    const metroStation = await MetroStation.findById(req.params.id)
      .populate('parkingSpots');
    
    if (!metroStation) {
      return res.status(404).json({
        success: false,
        message: 'Metro station not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: metroStation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Create new metro station
 * @route   POST /api/parking/stations
 * @access  Private/Admin
 */
exports.createMetroStation = async (req, res) => {
  try {
    const metroStation = await MetroStation.create(req.body);
    
    res.status(201).json({
      success: true,
      data: metroStation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Update metro station
 * @route   PUT /api/parking/stations/:id
 * @access  Private/Admin
 */
exports.updateMetroStation = async (req, res) => {
  try {
    const metroStation = await MetroStation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!metroStation) {
      return res.status(404).json({
        success: false,
        message: 'Metro station not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: metroStation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Delete metro station
 * @route   DELETE /api/parking/stations/:id
 * @access  Private/Admin
 */
exports.deleteMetroStation = async (req, res) => {
  try {
    const metroStation = await MetroStation.findById(req.params.id);
    
    if (!metroStation) {
      return res.status(404).json({
        success: false,
        message: 'Metro station not found'
      });
    }
    
    // Check if there are any parking spots associated with this station
    const associatedParkingSpots = await ParkingSpot.countDocuments({
      metroStation: req.params.id
    });
    
    if (associatedParkingSpots > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete metro station with associated parking spots'
      });
    }
    
    await metroStation.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get available parking spots for a specific date and time
 * @route   GET /api/parking/spots/available
 * @access  Public
 */
exports.getAvailableParkingSpots = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date, startTime, and endTime'
      });
    }
    
    // Convert to Date objects
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);
    
    // Find all parking spots
    const parkingSpots = await ParkingSpot.find({ active: true });
    
    // Find bookings that overlap with the requested time
    const bookings = await ParkingBooking.find({
      status: { $in: ['booked', 'checked-in'] },
      $or: [
        { 
          startTime: { $lte: endDateTime },
          endTime: { $gte: startDateTime }
        }
      ]
    });
    
    // Count bookings for each parking spot
    const bookingCounts = {};
    bookings.forEach(booking => {
      const spotId = booking.parkingSpot.toString();
      bookingCounts[spotId] = (bookingCounts[spotId] || 0) + 1;
    });
    
    // Filter spots that have available space
    const availableSpots = parkingSpots.filter(spot => {
      const bookedCount = bookingCounts[spot._id.toString()] || 0;
      return spot.availableSpots > bookedCount;
    });
    
    res.status(200).json({
      success: true,
      count: availableSpots.length,
      data: availableSpots
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
