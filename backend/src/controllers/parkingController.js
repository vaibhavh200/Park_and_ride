const ParkingLot = require('../models/parkingModel');
const ParkingBooking = require('../models/parkingBookingModel');
const MetroStation = require('../models/metroStationModel');
const QRCode = require('qrcode');

// Get all parking lots (with optional filtering)
exports.getAllParkingLots = async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by metro station if provided
    if (req.query.metroStation) {
      query.nearbyMetro = req.query.metroStation;
    }
    
    // Filter by active status
    query.active = true;
    
    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const parkingLots = await ParkingLot.find(query)
      .populate('nearbyMetro', 'name code')
      .skip(skip)
      .limit(limit);
    
    const total = await ParkingLot.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: parkingLots.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: {
        parkingLots
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get parking lot by ID
exports.getParkingLot = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id)
      .populate('nearbyMetro', 'name code address location');
    
    if (!parkingLot) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking lot not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        parkingLot
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Find nearby parking lots
exports.findNearbyParkingLots = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query; // maxDistance in meters
    
    if (!longitude || !latitude) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide longitude and latitude coordinates'
      });
    }
    
    const parkingLots = await ParkingLot.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      active: true
    }).populate('nearbyMetro', 'name code');
    
    res.status(200).json({
      status: 'success',
      results: parkingLots.length,
      data: {
        parkingLots
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Check parking availability
exports.checkAvailability = async (req, res) => {
  try {
    const { parkingLotId, startTime, endTime } = req.body;
    
    if (!parkingLotId || !startTime || !endTime) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide parkingLotId, startTime, and endTime'
      });
    }
    
    // Convert strings to Date objects if needed
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid date format'
      });
    }
    
    // Check if end time is after start time
    if (endDate <= startDate) {
      return res.status(400).json({
        status: 'fail',
        message: 'End time must be after start time'
      });
    }
    
    // Use the static method from the model
    const availability = await ParkingBooking.checkAvailability(parkingLotId, startDate, endDate);
    
    res.status(200).json({
      status: 'success',
      data: {
        availability
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Create a parking booking
exports.createBooking = async (req, res) => {
  try {
    // Required fields
    const {
      parkingLotId,
      startTime,
      endTime,
      bookingType,
      vehicle
    } = req.body;
    
    // Validate input
    if (!parkingLotId || !startTime || !endTime || !bookingType || !vehicle) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required booking information'
      });
    }
    
    // Convert strings to Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    // Get parking lot details
    const parkingLot = await ParkingLot.findById(parkingLotId);
    if (!parkingLot) {
      return res.status(404).json({
        status: 'fail',
        message: 'Parking lot not found'
      });
    }
    
    // Check availability
    const availability = await ParkingBooking.checkAvailability(parkingLotId, startDate, endDate);
    if (!availability.available) {
      return res.status(400).json({
        status: 'fail',
        message: 'No parking spots available for the selected time period'
      });
    }
    
    // Select a parking spot
    const spot = availability.availableSpots[0];
    
    // Calculate price based on booking type
    let price = 0;
    const durationHours = (endDate - startDate) / (1000 * 60 * 60);
    
    if (bookingType === 'hourly') {
      price = parkingLot.pricing.hourly * Math.ceil(durationHours);
    } else if (bookingType === 'daily') {
      price = parkingLot.pricing.daily * Math.ceil(durationHours / 24);
    } else if (bookingType === 'monthly') {
      price = parkingLot.pricing.monthly;
    }
    
    // Create booking
    const booking = await ParkingBooking.create({
      user: req.user._id,
      parkingLot: parkingLotId,
      parkingSpot: {
        number: spot.number,
        floor: spot.floor,
        type: spot.type
      },
      vehicle,
      bookingType,
      startTime: startDate,
      endTime: endDate,
      price,
      paymentStatus: 'pending' // Assume payment will be handled separately
    });
    
    // Generate QR Code
    const bookingInfo = {
      id: booking._id,
      parkingLot: parkingLot.name,
      spot: booking.parkingSpot.number,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: req.user._id
    };
    
    const qrCode = await QRCode.toDataURL(JSON.stringify(bookingInfo));
    booking.qrCode = qrCode;
    await booking.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await ParkingBooking.find({ user: req.user._id })
      .populate('parkingLot', 'name address')
      .sort({ startTime: -1 });
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: {
        bookings
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get a single booking by ID
exports.getBooking = async (req, res) => {
  try {
    const booking = await ParkingBooking.findById(req.params.id)
      .populate('parkingLot', 'name address location operatingHours')
      .populate('user', 'name email phoneNumber');
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }
    
    // Check if the booking belongs to the user or user is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this booking'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await ParkingBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }
    
    // Check if the booking belongs to the user or user is admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to cancel this booking'
      });
    }
    
    // Check if booking can be cancelled (not already checked-in or checked-out)
    if (booking.bookingStatus !== 'booked') {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot cancel booking in '${booking.bookingStatus}' status`
      });
    }
    
    // Calculate refund amount based on cancellation time
    const now = new Date();
    const bookingStartTime = new Date(booking.startTime);
    const hoursBeforeBooking = (bookingStartTime - now) / (1000 * 60 * 60);
    
    let refundAmount = 0;
    let refundStatus = 'not-applicable';
    
    if (hoursBeforeBooking >= 24) {
      // Full refund if cancelled more than 24 hours in advance
      refundAmount = booking.price;
      refundStatus = 'processed';
    } else if (hoursBeforeBooking >= 2) {
      // 50% refund if cancelled between 2-24 hours in advance
      refundAmount = booking.price * 0.5;
      refundStatus = 'processed';
    } else {
      // No refund if cancelled less than 2 hours in advance
      refundAmount = 0;
      refundStatus = 'declined';
    }
    
    // Update booking
    booking.bookingStatus = 'cancelled';
    booking.cancellationInfo = {
      cancelledAt: now,
      reason: req.body.reason || 'User cancelled',
      refundAmount,
      refundStatus
    };
    
    await booking.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Check-in for parking (scan QR code)
exports.checkIn = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide booking ID'
      });
    }
    
    const booking = await ParkingBooking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }
    
    // Verify booking status
    if (booking.bookingStatus !== 'booked') {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot check in with booking status: ${booking.bookingStatus}`
      });
    }
    
    // Update booking status
    booking.bookingStatus = 'checked-in';
    await booking.save();
    
    // Update the parking spot status in the parking lot
    const parkingLot = await ParkingLot.findById(booking.parkingLot);
    const spotIndex = parkingLot.spots.findIndex(spot => spot.number === booking.parkingSpot.number);
    
    if (spotIndex !== -1) {
      parkingLot.spots[spotIndex].isOccupied = true;
      await parkingLot.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Check-out from parking
exports.checkOut = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide booking ID'
      });
    }
    
    const booking = await ParkingBooking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found'
      });
    }
    
    // Verify booking status
    if (booking.bookingStatus !== 'checked-in') {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot check out with booking status: ${booking.bookingStatus}`
      });
    }
    
    // Update booking status
    booking.bookingStatus = 'checked-out';
    await booking.save();
    
    // Update the parking spot status in the parking lot
    const parkingLot = await ParkingLot.findById(booking.parkingLot);
    const spotIndex = parkingLot.spots.findIndex(spot => spot.number === booking.parkingSpot.number);
    
    if (spotIndex !== -1) {
      parkingLot.spots[spotIndex].isOccupied = false;
      await parkingLot.save();
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
}; 