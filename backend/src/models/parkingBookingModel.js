const mongoose = require('mongoose');

const parkingBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  parkingLot: {
    type: mongoose.Schema.ObjectId,
    ref: 'ParkingLot',
    required: [true, 'Booking must be for a parking lot']
  },
  parkingSpot: {
    number: String,
    floor: Number,
    type: {
      type: String,
      enum: ['standard', 'handicapped', 'electric-vehicle', 'premium']
    }
  },
  vehicle: {
    type: {
      type: String,
      enum: ['car', 'motorcycle', 'bicycle', 'ev'],
      required: [true, 'Vehicle type is required']
    },
    licensePlate: {
      type: String,
      required: [true, 'License plate is required']
    },
    make: String,
    model: String,
    color: String
  },
  bookingType: {
    type: String,
    enum: ['hourly', 'daily', 'monthly'],
    required: [true, 'Booking type is required']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  qrCode: String,
  price: {
    type: Number,
    required: [true, 'Booking must have a price']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['booked', 'checked-in', 'checked-out', 'cancelled'],
    default: 'booked'
  },
  cancellationInfo: {
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'declined', 'not-applicable']
    }
  },
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
parkingBookingSchema.index({ parkingLot: 1, startTime: 1 });
parkingBookingSchema.index({ user: 1, startTime: -1 });
parkingBookingSchema.index({ 'parkingSpot.number': 1, parkingLot: 1 });

// Pre-save hook to generate QR code
parkingBookingSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('parkingSpot')) {
    // Generate QR code for the booking
    const QRCode = require('qrcode');
    const bookingInfo = {
      id: this._id,
      user: this.user,
      parkingLot: this.parkingLot,
      spot: this.parkingSpot,
      startTime: this.startTime,
      endTime: this.endTime
    };
    try {
      this.qrCode = await QRCode.toDataURL(JSON.stringify(bookingInfo));
    } catch (err) {
      console.error('QR Code generation error:', err);
      next(err);
    }
  }
  next();
});

// Instance method to calculate booking duration
parkingBookingSchema.methods.getDuration = function() {
  return (this.endTime - this.startTime) / (1000 * 60 * 60); // Duration in hours
};

// Static method to check availability of parking spots
parkingBookingSchema.statics.checkAvailability = async function(parkingLotId, startTime, endTime) {
  // Find all bookings for the specified parking lot that overlap with the requested time period
  const overlappingBookings = await this.find({
    parkingLot: parkingLotId,
    bookingStatus: { $ne: 'cancelled' },
    $or: [
      // Case 1: startTime is between existing booking's start and end time
      { startTime: { $lte: startTime }, endTime: { $gte: startTime } },
      // Case 2: endTime is between existing booking's start and end time
      { startTime: { $lte: endTime }, endTime: { $gte: endTime } },
      // Case 3: new booking completely contains an existing booking
      { startTime: { $gte: startTime }, endTime: { $lte: endTime } }
    ]
  });
  
  // Get the parking lot details to know total available spots
  const ParkingLot = mongoose.model('ParkingLot');
  const parkingLot = await ParkingLot.findById(parkingLotId);
  
  if (!parkingLot) {
    throw new Error('Parking lot not found');
  }
  
  // Calculate number of available spots
  const occupiedSpotNumbers = overlappingBookings.map(booking => booking.parkingSpot.number);
  const availableSpots = parkingLot.spots.filter(spot => 
    !occupiedSpotNumbers.includes(spot.number) && !spot.isOccupied
  );
  
  return {
    available: availableSpots.length > 0,
    totalSpots: parkingLot.totalSpots,
    availableSpots: availableSpots,
    occupiedSpots: occupiedSpotNumbers.length
  };
};

const ParkingBooking = mongoose.model('ParkingBooking', parkingBookingSchema);
module.exports = ParkingBooking; 