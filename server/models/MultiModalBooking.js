const mongoose = require('mongoose');
const crypto = require('crypto');

const MultiModalBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Parking booking details
  parkingBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingBooking',
    required: true
  },
  // Ride booking details
  rideBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RideBooking',
    required: true
  },
  // Overall booking status
  status: {
    type: String,
    enum: ['confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'confirmed'
  },
  // Combined payment details
  totalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit', 'debit', 'upi', 'wallet', 'cash'],
    required: true
  },
  paymentDate: Date,
  // For tracking purposes
  bookingCode: {
    type: String,
    unique: true
  },
  notes: String,
  // For management and cancellation
  cancellationReason: String,
  cancelledAt: Date,
  // Loyalty program integration
  isEligibleForLoyaltyPoints: {
    type: Boolean,
    default: true
  },
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate a unique booking code before saving
MultiModalBookingSchema.pre('save', function(next) {
  if (!this.bookingCode) {
    // Create a unique booking code format: MULTI-YYYYMMDD-XXXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.bookingCode = `MULTI-${date}-${random}`;
  }
  next();
});

// Calculate if the booking is eligible for loyalty points
MultiModalBookingSchema.virtual('calculateLoyaltyPoints').get(function() {
  // Basic calculation: 1 point per 10 units of currency spent
  if (this.isEligibleForLoyaltyPoints && this.paymentStatus === 'completed') {
    return Math.floor(this.totalAmount / 10);
  }
  return 0;
});

// Index for common search patterns
MultiModalBookingSchema.index({ user: 1, createdAt: -1 });
MultiModalBookingSchema.index({ status: 1 });
MultiModalBookingSchema.index({ bookingCode: 1 });

module.exports = mongoose.model('MultiModalBooking', MultiModalBookingSchema); 