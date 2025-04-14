const ParkingBooking = require('../models/ParkingBooking');
const ParkingSpot = require('../models/ParkingSpot');
const User = require('../models/User');

/**
 * @desc    Get all bookings (admin only)
 * @route   GET /api/bookings
 * @access  Private/Admin
 */
exports.getAllBookings = async (req, res) => {
  try {
    const { status, parkingSpot, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (parkingSpot) {
      query.parkingSpot = parkingSpot;
    }
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }
    
    const bookings = await ParkingBooking.find(query)
      .populate('user', 'name email phone')
      .populate('parkingSpot', 'name location');
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
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
 * @desc    Get logged-in user's bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
exports.getMyBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }
    
    const bookings = await ParkingBooking.find(query)
      .populate('parkingSpot', 'name location hourlyRate dailyRate monthlyRate');
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
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
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
exports.getBooking = async (req, res) => {
  try {
    const booking = await ParkingBooking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('parkingSpot');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
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
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Private
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      parkingSpot,
      vehicleDetails,
      bookingType,
      startTime,
      endTime,
      paymentMethod
    } = req.body;
    
    console.log(`Creating booking for parking spot: ${parkingSpot}, user: ${req.user.id}`);
    
    // Check if parking spot exists
    const spot = await ParkingSpot.findById(parkingSpot);
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    // Check availability
    const overlappingBookings = await ParkingBooking.countDocuments({
      parkingSpot,
      status: { $in: ['booked', 'checked-in'] },
      $or: [
        { 
          startTime: { $lte: new Date(endTime) },
          endTime: { $gte: new Date(startTime) }
        }
      ]
    });
    
    if (spot.availableSpots <= overlappingBookings) {
      return res.status(400).json({
        success: false,
        message: 'No parking spots available for the selected time period'
      });
    }
    
    // Calculate amount based on booking type
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationInHours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    let amount = 0;
    if (bookingType === 'hourly') {
      amount = spot.hourlyRate * durationInHours;
    } else if (bookingType === 'daily') {
      amount = spot.dailyRate * Math.ceil(durationInHours / 24);
    } else if (bookingType === 'monthly') {
      amount = spot.monthlyRate;
    }
    
    // Apply tax
    const taxRate = 0.18; // 18% tax
    const tax = amount * taxRate;
    const totalAmount = amount + tax;
    
    // Create booking
    const bookingData = {
      user: req.user.id,
      parkingSpot,
      vehicleDetails,
      bookingType,
      startTime,
      endTime,
      amount,
      tax,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending' // Assuming payment is handled separately
    };
    
    console.log('Creating booking with data:', bookingData);
    const booking = await ParkingBooking.create(bookingData);
    
    // Generate QR code for entry
    booking.generateQRCode();
    await booking.save();
    
    // Populate the booking with user and parkingSpot data
    const populatedBooking = await ParkingBooking.findById(booking._id)
      .populate('user', 'name email')
      .populate('parkingSpot', 'name location hourlyRate');
    
    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    const booking = await ParkingBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to cancel this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'checked-in' || booking.status === 'checked-out') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that has already been checked in or out'
      });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled'
      });
    }
    
    // Calculate refund amount based on cancellation time
    const now = new Date();
    const bookingStart = new Date(booking.startTime);
    const hoursBeforeBooking = Math.floor((bookingStart - now) / (1000 * 60 * 60));
    
    let refundAmount = 0;
    
    // Refund policy: full refund if cancelled 24+ hours before, 75% if 12-24 hours before, 50% if 2-12 hours before, no refund if <2 hours before
    if (hoursBeforeBooking >= 24) {
      refundAmount = booking.totalAmount;
    } else if (hoursBeforeBooking >= 12) {
      refundAmount = booking.totalAmount * 0.75;
    } else if (hoursBeforeBooking >= 2) {
      refundAmount = booking.totalAmount * 0.5;
    }
    
    // If the booking was checked-in but never checked-out, we need to free up the parking spot
    if (booking.status === 'checked-in') {
      // Increase available spots in parking lot
      const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
      if (parkingSpot) {
        parkingSpot.availableSpots = Math.min(parkingSpot.totalSpots, parkingSpot.availableSpots + 1);
        await parkingSpot.save();
      }
    }
    
    // Update booking
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.refundAmount = refundAmount;
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
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
 * @desc    Check in
 * @route   PUT /api/bookings/:id/check-in
 * @access  Private
 */
exports.checkIn = async (req, res) => {
  try {
    const booking = await ParkingBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // In a real app, this would verify QR code or license plate
    // For now, just checking user and booking status
    
    // Check if user is authorized or if it's an admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check in for this booking'
      });
    }
    
    // Check if booking is valid for check-in
    if (booking.status !== 'booked' && booking.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in a booking with status: ${booking.status}. Booking must be in 'booked' or 'upcoming' status.`
      });
    }
    
    // Check if payment has been completed
    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be completed before check-in'
      });
    }
    
    // Update booking
    booking.status = 'checked-in';
    booking.entryTime = new Date();
    
    // Reduce available spots in parking lot
    const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
    if (parkingSpot) {
      // Make sure we don't go below zero
      parkingSpot.availableSpots = Math.max(0, parkingSpot.availableSpots - 1);
      await parkingSpot.save();
      
      console.log(`Updated parking spot ${parkingSpot._id}, available spots: ${parkingSpot.availableSpots}`);
    } else {
      console.log(`Parking spot not found for booking: ${booking._id}`);
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
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
 * @desc    Check out
 * @route   PUT /api/bookings/:id/check-out
 * @access  Private
 */
exports.checkOut = async (req, res) => {
  try {
    const booking = await ParkingBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // In a real app, this might verify license plate or QR code
    // For now, just checking user and booking status
    
    // Check if user is authorized or if it's an admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check out for this booking'
      });
    }
    
    // Check if booking is valid for check-out
    if (booking.status !== 'checked-in') {
      return res.status(400).json({
        success: false,
        message: `Cannot check out a booking with status: ${booking.status}. Booking must be in 'checked-in' status.`
      });
    }
    
    // Update booking
    booking.status = 'checked-out';
    booking.exitTime = new Date();
    
    // In a real app, calculate any additional charges for late check-out
    // For the demo, we're assuming no additional charges
    
    // Increase available spots in parking lot
    const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
    if (parkingSpot) {
      // Make sure we don't exceed total spots
      parkingSpot.availableSpots = Math.min(parkingSpot.totalSpots, parkingSpot.availableSpots + 1);
      await parkingSpot.save();
      
      console.log(`Updated parking spot ${parkingSpot._id}, available spots: ${parkingSpot.availableSpots}`);
    } else {
      console.log(`Parking spot not found for booking: ${booking._id}`);
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
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
 * @desc    Process payment for booking
 * @route   PUT /api/bookings/:id/payment
 * @access  Private
 */
exports.processPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    
    const booking = await ParkingBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    console.log(`Processing payment for booking: ${booking._id}, status: ${booking.status}, payment status: ${booking.paymentStatus}`);
    
    // Check if user is authorized or if it's an admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process payment for this booking'
      });
    }
    
    // Check if booking is valid for payment
    if (booking.status !== 'booked' && booking.status !== 'upcoming') {
      return res.status(400).json({
        success: false,
        message: `Cannot process payment for a booking with status: ${booking.status}. Booking must be in 'booked' or 'upcoming' status.`
      });
    }
    
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed for this booking'
      });
    }
    
    // Update booking payment status
    booking.paymentStatus = 'completed';
    booking.paymentMethod = paymentMethod || booking.paymentMethod;
    booking.paymentDate = new Date();
    
    await booking.save();
    
    console.log(`Payment processed successfully for booking: ${booking._id}`);
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get booking by booking code
 * @route   GET /api/bookings/by-code/:code
 * @access  Private
 */
exports.getBookingByCode = async (req, res) => {
  try {
    const booking = await ParkingBooking.findOne({ bookingCode: req.params.code })
      .populate('user', 'name email phone')
      .populate('parkingSpot');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
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
 * @desc    Generate receipt for a booking
 * @route   GET /api/bookings/:id/receipt
 * @access  Private
 */
exports.generateReceipt = async (req, res) => {
  try {
    console.log("Generating receipt for booking ID:", req.params.id);
    
    const booking = await ParkingBooking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('parkingSpot', 'name location hourlyRate dailyRate monthlyRate');
    
    if (!booking) {
      console.log("Booking not found:", req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    console.log("Found booking:", booking._id);
    
    // Check if user is authorized to view this booking
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log("User not authorized:", req.user.id);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    // Calculate booking details
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const durationInHours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    const durationInDays = Math.ceil(durationInHours / 24);
    
    // Format dates and times
    const formattedStartDate = startTime.toLocaleDateString();
    const formattedStartTime = startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const formattedEndDate = endTime.toLocaleDateString();
    const formattedEndTime = endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    // Format location data
    let locationDisplay = 'Location not available';
    
    if (booking.parkingSpot && booking.parkingSpot.location) {
      if (typeof booking.parkingSpot.location === 'object') {
        // Check if location has an address object
        if (booking.parkingSpot.location.address) {
          const addr = booking.parkingSpot.location.address;
          if (typeof addr === 'object') {
            // Format address from object
            const addressParts = [];
            if (addr.street) addressParts.push(addr.street);
            if (addr.city) addressParts.push(addr.city);
            if (addr.state) addressParts.push(addr.state);
            if (addr.zipCode) addressParts.push(addr.zipCode);
            locationDisplay = addressParts.join(', ');
          } else if (typeof addr === 'string') {
            locationDisplay = addr;
          }
        } else {
          // If just coordinates, use a simple string representation
          locationDisplay = 'Location coordinates available';
        }
      } else if (typeof booking.parkingSpot.location === 'string') {
        locationDisplay = booking.parkingSpot.location;
      }
    }
    
    // Generate receipt data
    const receiptData = {
      bookingId: booking.bookingCode || booking._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      dateCreated: new Date(booking.createdAt).toLocaleDateString(),
      user: {
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone
      },
      parking: {
        name: booking.parkingSpot.name,
        location: locationDisplay
      },
      timeSlot: {
        startDate: formattedStartDate,
        startTime: formattedStartTime,
        endDate: formattedEndDate,
        endTime: formattedEndTime,
        duration: {
          hours: durationInHours,
          days: durationInDays
        }
      },
      vehicle: booking.vehicleDetails || { registrationNumber: 'Not provided' },
      payment: {
        baseAmount: booking.amount,
        tax: booking.tax,
        totalAmount: booking.totalAmount,
        method: booking.paymentMethod,
        date: booking.paymentDate ? new Date(booking.paymentDate).toLocaleDateString() : null
      },
      company: {
        name: 'Park & Ride',
        address: '123 Parking Street, Parkington, PK 12345',
        email: 'contact@parkandride.com',
        phone: '+1 234 567 8901',
        website: 'www.parkandride.com',
        taxId: 'TAX123456789'
      }
    };
    
    console.log("Generated receipt data successfully");
    
    res.status(200).json({
      success: true,
      data: receiptData
    });
    
  } catch (err) {
    console.error('Error generating receipt:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Modify an existing booking
 * @route   PUT /api/bookings/:id/modify
 * @access  Private
 */
exports.modifyBooking = async (req, res) => {
  try {
    const { newStartTime, newEndTime, changeReason } = req.body;
    
    // Find the booking
    const booking = await ParkingBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this booking'
      });
    }
    
    // Check if booking can be modified
    if (!booking.canModify) {
      return res.status(400).json({
        success: false,
        message: 'This booking cannot be modified. It may have already started, been checked in, or cancelled.'
      });
    }
    
    // Store the original booking details for history
    const originalStartTime = booking.startTime;
    const originalEndTime = booking.endTime;
    const originalAmount = booking.amount;
    
    // Create the modification record
    const modification = {
      modifiedAt: new Date(),
      originalStartTime,
      originalEndTime,
      originalAmount,
      changeReason,
      changedBy: req.user.id
    };
    
    // Update the booking times
    if (newStartTime) booking.startTime = new Date(newStartTime);
    if (newEndTime) booking.endTime = new Date(newEndTime);
    
    // Check for conflicts with the new time slot
    const overlappingBookings = await ParkingBooking.countDocuments({
      _id: { $ne: booking._id }, // Exclude current booking
      parkingSpot: booking.parkingSpot,
      status: { $in: ['booked', 'checked-in'] },
      $or: [
        { 
          startTime: { $lte: booking.endTime },
          endTime: { $gte: booking.startTime }
        }
      ]
    });
    
    // Get the parking spot to check availability
    const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
    if (parkingSpot && parkingSpot.availableSpots <= overlappingBookings) {
      return res.status(400).json({
        success: false,
        message: 'No parking spots available for the selected time period'
      });
    }
    
    // Recalculate amount based on booking type and duration
    const durationInHours = Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60));
    
    let newAmount = 0;
    if (booking.bookingType === 'hourly') {
      newAmount = parkingSpot.hourlyRate * durationInHours;
    } else if (booking.bookingType === 'daily') {
      newAmount = parkingSpot.dailyRate * Math.ceil(durationInHours / 24);
    } else if (booking.bookingType === 'monthly') {
      newAmount = parkingSpot.monthlyRate;
    }
    
    // Calculate new tax and total
    const taxRate = 0.18; // 18% tax
    const newTax = newAmount * taxRate;
    const newTotalAmount = newAmount + newTax;
    
    // Update the amounts
    booking.amount = newAmount;
    booking.tax = newTax;
    booking.totalAmount = newTotalAmount;
    
    // Update check-in deadline
    const deadline = new Date(booking.startTime);
    deadline.setMinutes(deadline.getMinutes() + 30);
    booking.checkInDeadline = deadline;
    
    // Add the modification to history
    if (!booking.modifications) booking.modifications = [];
    booking.modifications.push(modification);
    
    // If the amount changed, update payment status
    if (newTotalAmount > originalAmount) {
      booking.paymentStatus = 'pending';
    }
    
    // Save the updated booking
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking successfully modified',
      data: booking
    });
  } catch (err) {
    console.error('Error modifying booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Check in using License Plate Recognition (LPR)
 * @route   POST /api/bookings/lpr-check-in
 * @access  Private
 */
exports.lprCheckIn = async (req, res) => {
  try {
    const { licensePlate, parkingSpotId } = req.body;
    
    if (!licensePlate) {
      return res.status(400).json({
        success: false,
        message: 'License plate is required'
      });
    }
    
    // Find booking by vehicle registration number
    const booking = await ParkingBooking.findOne({
      'vehicleDetails.registrationNumber': licensePlate,
      status: 'booked',
      parkingSpot: parkingSpotId ? parkingSpotId : { $exists: true },
      startTime: { $lte: new Date(new Date().getTime() + 30 * 60 * 1000) }, // Within next 30 minutes
      endTime: { $gte: new Date() } // Not yet ended
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No active booking found for this license plate'
      });
    }
    
    // Check if payment has been completed
    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be completed before check-in'
      });
    }
    
    // Check if it's too early to check in (more than 30 minutes before start time)
    const now = new Date();
    const start = new Date(booking.startTime);
    const timeToStart = (start - now) / (1000 * 60);
    
    if (timeToStart > 30) {
      return res.status(400).json({
        success: false,
        message: `Too early to check in. Please come back within 30 minutes of your booking time.`
      });
    }
    
    // Update booking
    booking.status = 'checked-in';
    booking.entryTime = now;
    booking.entryMethod = 'lpr';
    
    // Check if check-in is late
    if (now > start) {
      booking.lateCheckIn = true;
    }
    
    // Reduce available spots in parking lot
    const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
    if (parkingSpot) {
      // Make sure we don't go below zero
      parkingSpot.availableSpots = Math.max(0, parkingSpot.availableSpots - 1);
      await parkingSpot.save();
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully checked in using LPR',
      data: booking
    });
  } catch (err) {
    console.error('Error with LPR check-in:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Check in using RFID
 * @route   POST /api/bookings/rfid-check-in
 * @access  Private
 */
exports.rfidCheckIn = async (req, res) => {
  try {
    const { rfidTag, parkingSpotId } = req.body;
    
    if (!rfidTag) {
      return res.status(400).json({
        success: false,
        message: 'RFID tag is required'
      });
    }
    
    // Find user by RFID tag
    const user = await User.findOne({ rfidTag });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this RFID tag'
      });
    }
    
    // Find booking for this user
    const booking = await ParkingBooking.findOne({
      user: user._id,
      status: 'booked',
      parkingSpot: parkingSpotId ? parkingSpotId : { $exists: true },
      startTime: { $lte: new Date(new Date().getTime() + 30 * 60 * 1000) }, // Within next 30 minutes
      endTime: { $gte: new Date() } // Not yet ended
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No active booking found for this RFID tag'
      });
    }
    
    // Check if payment has been completed
    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be completed before check-in'
      });
    }
    
    // Update booking
    booking.status = 'checked-in';
    booking.entryTime = new Date();
    booking.entryMethod = 'rfid';
    booking.rfidTag = rfidTag;
    
    // Check if check-in is late
    const now = new Date();
    const start = new Date(booking.startTime);
    if (now > start) {
      booking.lateCheckIn = true;
    }
    
    // Reduce available spots in parking lot
    const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
    if (parkingSpot) {
      // Make sure we don't go below zero
      parkingSpot.availableSpots = Math.max(0, parkingSpot.availableSpots - 1);
      await parkingSpot.save();
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Successfully checked in using RFID',
      data: booking
    });
  } catch (err) {
    console.error('Error with RFID check-in:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get booking by vehicle registration number
 * @route   GET /api/bookings/vehicle/:registrationNumber
 * @access  Private
 */
exports.getBookingByVehicle = async (req, res) => {
  try {
    const booking = await ParkingBooking.findOne({
      'vehicleDetails.registrationNumber': req.params.registrationNumber,
      status: { $in: ['booked', 'checked-in'] },
      endTime: { $gte: new Date() } // Not yet ended
    }).populate('parkingSpot', 'name location hourlyRate');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No active booking found for this vehicle'
      });
    }
    
    // For security, only allow admin or the booking owner to see the details
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Error finding booking by vehicle:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get bookings by status
 * @route   GET /api/bookings/status/:status
 * @access  Private
 */
exports.getBookingsByStatus = async (req, res) => {
  try {
    // For regular users, only show their own bookings
    // For admins, show all bookings with that status
    const query = req.user.role === 'admin'
      ? { status: req.params.status }
      : { status: req.params.status, user: req.user.id };
      
    const bookings = await ParkingBooking.find(query)
      .populate('parkingSpot', 'name location hourlyRate')
      .sort({ startTime: 1 });
      
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error('Error getting bookings by status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Request extension for a booking
 * @route   PUT /api/bookings/:id/request-extension
 * @access  Private
 */
exports.requestExtension = async (req, res) => {
  try {
    const { additionalHours, reason } = req.body;
    
    if (!additionalHours || additionalHours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a valid number of additional hours'
      });
    }
    
    const booking = await ParkingBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to extend this booking'
      });
    }
    
    // Can only extend bookings that are checked in or currently active
    if (booking.status !== 'checked-in' && booking.status !== 'booked') {
      return res.status(400).json({
        success: false,
        message: `Cannot extend a booking with status: ${booking.status}`
      });
    }
    
    // Flag the extension as requested
    booking.extensionRequested = true;
    booking.notes = booking.notes ? `${booking.notes}\nExtension requested: ${additionalHours} hours. Reason: ${reason}` : 
      `Extension requested: ${additionalHours} hours. Reason: ${reason}`;
    
    // Store the proposed new end time temporarily
    const newEndTime = new Date(booking.endTime);
    newEndTime.setHours(newEndTime.getHours() + parseInt(additionalHours));
    
    // Check availability for the extended time
    const overlappingBookings = await ParkingBooking.countDocuments({
      _id: { $ne: booking._id }, // Exclude current booking
      parkingSpot: booking.parkingSpot,
      status: { $in: ['booked', 'checked-in'] },
      startTime: { $lt: newEndTime },
      endTime: { $gt: booking.endTime }
    });
    
    // Get the parking spot to check availability
    const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
    
    // For automatic approval if availability is good
    const autoApprove = parkingSpot && parkingSpot.availableSpots > overlappingBookings;
    
    if (autoApprove || req.user.role === 'admin') {
      // Auto-approve extension or admin is making the request
      booking.extensionApproved = true;
      booking.endTime = newEndTime;
      
      // Calculate additional amount
      const additionalAmount = (parkingSpot.hourlyRate || 0) * additionalHours;
      const additionalTax = additionalAmount * 0.18; // 18% tax
      
      booking.amount += additionalAmount;
      booking.tax += additionalTax;
      booking.totalAmount += (additionalAmount + additionalTax);
      
      // Additional payment required
      booking.paymentStatus = 'pending';
      
      // Add modification record
      if (!booking.modifications) booking.modifications = [];
      booking.modifications.push({
        modifiedAt: new Date(),
        originalEndTime: booking.endTime,
        originalAmount: booking.amount - additionalAmount,
        changeReason: `Extension for ${additionalHours} hours. ${reason}`,
        changedBy: req.user.id
      });
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: autoApprove ? 'Extension approved automatically' : 'Extension request submitted for approval',
      requiresPayment: autoApprove,
      data: booking
    });
  } catch (err) {
    console.error('Error requesting extension:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Approve extension request (admin only)
 * @route   PUT /api/bookings/:id/approve-extension
 * @access  Private/Admin
 */
exports.approveExtension = async (req, res) => {
  try {
    const { approved, additionalHours } = req.body;
    
    const booking = await ParkingBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (!booking.extensionRequested) {
      return res.status(400).json({
        success: false,
        message: 'No extension has been requested for this booking'
      });
    }
    
    booking.extensionApproved = approved;
    
    if (approved) {
      // Update the end time
      const newEndTime = new Date(booking.endTime);
      newEndTime.setHours(newEndTime.getHours() + parseInt(additionalHours || 1));
      booking.endTime = newEndTime;
      
      // Calculate additional amount
      const parkingSpot = await ParkingSpot.findById(booking.parkingSpot);
      const additionalAmount = (parkingSpot.hourlyRate || 0) * (additionalHours || 1);
      const additionalTax = additionalAmount * 0.18; // 18% tax
      
      booking.amount += additionalAmount;
      booking.tax += additionalTax;
      booking.totalAmount += (additionalAmount + additionalTax);
      
      // Additional payment required
      booking.paymentStatus = 'pending';
      
      // Add to notes
      booking.notes = booking.notes ? `${booking.notes}\nExtension approved by admin.` : 'Extension approved by admin.';
      
      // Add modification record
      if (!booking.modifications) booking.modifications = [];
      booking.modifications.push({
        modifiedAt: new Date(),
        originalEndTime: booking.endTime,
        originalAmount: booking.amount - additionalAmount,
        changeReason: `Extension approved by admin for ${additionalHours || 1} hours.`,
        changedBy: req.user.id
      });
    } else {
      // Update notes
      booking.notes = booking.notes ? `${booking.notes}\nExtension request denied by admin.` : 'Extension request denied by admin.';
    }
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: approved ? 'Extension approved successfully' : 'Extension request denied',
      data: booking
    });
  } catch (err) {
    console.error('Error approving extension:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Assign a specific parking spot to a booking
 * @route   PUT /api/bookings/:id/assign-spot
 * @access  Private/Admin
 */
exports.assignSpot = async (req, res) => {
  try {
    const { floor, spotNumber, section } = req.body;
    
    const booking = await ParkingBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Can only assign spots to bookings that are not checked out or cancelled
    if (booking.status === 'checked-out' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot assign a spot to a booking with status: ${booking.status}`
      });
    }
    
    // Assign the spot
    booking.assignedSpot = {
      floor: floor || 1,
      spotNumber: spotNumber || 'A1',
      section: section || 'General'
    };
    
    // Add to notes
    booking.notes = booking.notes 
      ? `${booking.notes}\nSpot assigned: Floor ${floor || 1}, Spot ${spotNumber || 'A1'}, Section ${section || 'General'}.` 
      : `Spot assigned: Floor ${floor || 1}, Spot ${spotNumber || 'A1'}, Section ${section || 'General'}.`;
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Parking spot assigned successfully',
      data: booking
    });
  } catch (err) {
    console.error('Error assigning spot:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
