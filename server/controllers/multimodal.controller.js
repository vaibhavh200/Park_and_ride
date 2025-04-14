const mongoose = require('mongoose');
const MultiModalBooking = require('../models/MultiModalBooking');
const ParkingBooking = require('../models/ParkingBooking');
const RideBooking = require('../models/RideBooking');
const ParkingSpot = require('../models/ParkingSpot');
const RideService = require('../models/RideService');
const { generateUniqueCode } = require('../utils/bookingUtils');
const User = require('../models/User');

/**
 * @desc    Create a multi-modal booking (parking + ride)
 * @route   POST /api/multimodal/bookings
 * @access  Private
 */
exports.createMultiModalBooking = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const {
      // Parking details
      parkingSpot,
      vehicleDetails,
      parkingStartTime,
      parkingEndTime,
      
      // Ride details
      rideService,
      pickupLocation,
      dropoffLocation,
      distance,
      estimatedDuration,
      passengers,
      isShared,
      scheduledFor,
      
      // Common details
      paymentMethod
    } = req.body;
    
    // STEP 1: Create parking booking
    // Check if parking spot exists
    const spot = await ParkingSpot.findById(parkingSpot);
    if (!spot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }
    
    // Check parking availability
    const overlappingBookings = await ParkingBooking.countDocuments({
      parkingSpot,
      status: { $in: ['booked', 'checked-in'] },
      $or: [
        { 
          startTime: { $lte: new Date(parkingEndTime) },
          endTime: { $gte: new Date(parkingStartTime) }
        }
      ]
    });
    
    if (spot.availableSpots <= overlappingBookings) {
      return res.status(400).json({
        success: false,
        message: 'No parking spots available for the selected time period'
      });
    }
    
    // Calculate parking amount
    const parkingStart = new Date(parkingStartTime);
    const parkingEnd = new Date(parkingEndTime);
    const parkingDurationInHours = Math.ceil((parkingEnd - parkingStart) / (1000 * 60 * 60));
    
    let parkingAmount = 0;
    // Use hourly rate for durations under 24 hours
    if (parkingDurationInHours <= 24) {
      parkingAmount = spot.hourlyRate * parkingDurationInHours;
    } else {
      // Use daily rate for longer durations
      const days = Math.ceil(parkingDurationInHours / 24);
      parkingAmount = spot.dailyRate * days;
    }
    
    // Apply parking tax
    const parkingTaxRate = 0.18; // 18% tax
    const parkingTax = parkingAmount * parkingTaxRate;
    const parkingTotalAmount = parkingAmount + parkingTax;
    
    // STEP 2: Create ride booking
    // Validate ride service
    const serviceDetails = await RideService.findById(rideService);
    if (!serviceDetails) {
      return res.status(404).json({
        success: false,
        message: 'Ride service not found'
      });
    }
    
    // Validate number of passengers
    if (passengers > serviceDetails.maxPassengers) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${serviceDetails.maxPassengers} passengers allowed for this service`
      });
    }
    
    // Calculate ride fare
    const baseFare = serviceDetails.baseRate;
    const distanceFare = serviceDetails.perKmRate * distance;
    const timeFare = serviceDetails.perMinuteRate * estimatedDuration;
    
    // Calculate ride tax
    const rideTaxRate = 0.18; // 18% tax
    const subtotal = baseFare + distanceFare + timeFare;
    const rideTax = subtotal * rideTaxRate;
    
    // Apply discount for shared rides if applicable
    let discount = 0;
    if (isShared) {
      discount = subtotal * 0.1; // 10% discount for shared rides
    }
    
    const rideTotalFare = Math.max(serviceDetails.minFare, subtotal + rideTax - discount);
    
    // STEP 3: Create the bookings with the transaction
    // Create parking booking
    const parkingBooking = new ParkingBooking({
      user: req.user.id,
      parkingSpot,
      vehicleDetails,
      bookingType: 'hourly',
      startTime: parkingStartTime,
      endTime: parkingEndTime,
      amount: parkingAmount,
      tax: parkingTax,
      totalAmount: parkingTotalAmount,
      paymentMethod,
      paymentStatus: 'pending'
    });
    
    // Create ride booking
    const rideBooking = new RideBooking({
      user: req.user.id,
      rideService,
      pickupLocation,
      dropoffLocation,
      distance,
      estimatedDuration,
      passengers,
      isShared,
      scheduledFor: new Date(scheduledFor),
      fareDetails: {
        baseFare,
        distanceFare,
        timeFare,
        tax: rideTax,
        discount,
        totalFare: rideTotalFare
      },
      paymentMethod,
      status: 'pending'
    });
    
    // Save both bookings within the transaction
    await parkingBooking.save({ session });
    await rideBooking.save({ session });
    
    // Calculate combined amount
    const totalAmount = parkingTotalAmount + rideTotalFare;
    
    // Apply bundle discount (5% off the total)
    const bundleDiscount = totalAmount * 0.05;
    const discountedTotal = totalAmount - bundleDiscount;
    
    // Create multi-modal booking
    const multiModalBooking = new MultiModalBooking({
      user: req.user.id,
      parkingBooking: parkingBooking._id,
      rideBooking: rideBooking._id,
      totalAmount: discountedTotal,
      discount: bundleDiscount,
      paymentMethod,
      paymentStatus: 'pending'
    });
    
    await multiModalBooking.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    
    // For response, populate the multi-modal booking with related bookings
    const populatedBooking = await MultiModalBooking.findById(multiModalBooking._id)
      .populate({
        path: 'parkingBooking',
        populate: {
          path: 'parkingSpot',
          select: 'name location'
        }
      })
      .populate({
        path: 'rideBooking',
        populate: {
          path: 'rideService',
          select: 'name type'
        }
      });
    
    res.status(201).json({
      success: true,
      message: 'Multi-modal booking created successfully',
      data: populatedBooking
    });
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error('Create multi-modal booking error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    // End session
    session.endSession();
  }
};

/**
 * @desc    Get all user's multi-modal bookings
 * @route   GET /api/multimodal/bookings
 * @access  Private
 */
exports.getMyMultiModalBookings = async (req, res) => {
  try {
    const bookings = await MultiModalBooking.find({ user: req.user.id })
      .populate({
        path: 'parkingBooking',
        populate: {
          path: 'parkingSpot',
          select: 'name location'
        }
      })
      .populate({
        path: 'rideBooking',
        populate: {
          path: 'rideService',
          select: 'name type'
        }
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get multi-modal bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get a specific multi-modal booking
 * @route   GET /api/multimodal/bookings/:id
 * @access  Private
 */
exports.getMultiModalBooking = async (req, res) => {
  try {
    const booking = await MultiModalBooking.findById(req.params.id)
      .populate({
        path: 'parkingBooking',
        populate: {
          path: 'parkingSpot',
          select: 'name location hourlyRate dailyRate'
        }
      })
      .populate({
        path: 'rideBooking',
        populate: {
          path: 'rideService',
          select: 'name type baseRate perKmRate'
        }
      });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to view this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get multi-modal booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Process payment for a multi-modal booking
 * @route   PUT /api/multimodal/bookings/:id/payment
 * @access  Private
 */
exports.processPayment = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const booking = await MultiModalBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process payment for this booking'
      });
    }
    
    // Check if payment is already completed
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed for this booking'
      });
    }
    
    // Update payment status for multi-modal booking
    booking.paymentStatus = 'completed';
    booking.paymentDate = new Date();
    await booking.save({ session });
    
    // Update payment status for parking booking
    await ParkingBooking.findByIdAndUpdate(
      booking.parkingBooking,
      {
        paymentStatus: 'completed',
        paymentDate: new Date()
      },
      { session }
    );
    
    // Update payment status for ride booking
    await RideBooking.findByIdAndUpdate(
      booking.rideBooking,
      {
        paymentStatus: 'completed',
        paymentDate: new Date()
      },
      { session }
    );
    
    // If user has loyalty program, add points
    if (booking.isEligibleForLoyaltyPoints) {
      const loyaltyPoints = Math.floor(booking.totalAmount / 10);
      await User.findByIdAndUpdate(
        booking.user,
        {
          $inc: { 'loyaltyPoints.points': loyaltyPoints },
          $push: {
            'loyaltyPoints.pointsHistory': {
              points: loyaltyPoints,
              reason: `Multi-modal booking ${booking.bookingCode}`,
              date: new Date()
            }
          }
        },
        { session }
      );
      
      booking.loyaltyPointsEarned = loyaltyPoints;
      await booking.save({ session });
    }
    
    // Commit transaction
    await session.commitTransaction();
    
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: booking
    });
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error('Process payment error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    // End session
    session.endSession();
  }
};

/**
 * @desc    Cancel a multi-modal booking
 * @route   PUT /api/multimodal/bookings/:id/cancel
 * @access  Private
 */
exports.cancelMultiModalBooking = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    const { cancellationReason } = req.body;
    
    // Find the booking
    const booking = await MultiModalBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }
    
    // Update parking booking
    await ParkingBooking.findByIdAndUpdate(
      booking.parkingBooking,
      {
        status: 'cancelled',
        cancellationReason,
        cancelledAt: new Date()
      },
      { session }
    );
    
    // Update ride booking
    await RideBooking.findByIdAndUpdate(
      booking.rideBooking,
      {
        status: 'cancelled',
        cancellationReason,
        cancelledAt: new Date()
      },
      { session }
    );
    
    // Update multi-modal booking
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancelledAt = new Date();
    
    // If payment was completed, set status to refunded
    if (booking.paymentStatus === 'completed') {
      booking.paymentStatus = 'refunded';
    }
    
    // Remove loyalty points eligibility
    booking.isEligibleForLoyaltyPoints = false;
    booking.loyaltyPointsEarned = 0;
    
    await booking.save({ session });
    
    // Commit transaction
    await session.commitTransaction();
    
    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
    
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error('Cancel multi-modal booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  } finally {
    // End session
    session.endSession();
  }
}; 