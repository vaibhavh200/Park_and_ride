const mongoose = require('mongoose');
const crypto = require('crypto');

const ParkingBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: true
  },
  vehicleDetails: {
    model: String,
    color: String,
    registrationNumber: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['car', 'motorcycle', 'truck', 'van', 'other'],
      default: 'car'
    }
  },
  bookingType: {
    type: String,
    enum: ['hourly', 'daily', 'monthly'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
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
  paymentId: {
    type: String
  },
  status: {
    type: String,
    enum: ['booked', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'booked'
  },
  qrCode: {
    type: String
  },
  rfidTag: {
    type: String
  },
  entryTime: {
    type: Date
  },
  exitTime: {
    type: Date
  },
  bookingCode: {
    type: String,
    unique: true
  },
  cancellationReason: {
    type: String
  },
  refundAmount: {
    type: Number
  },
  notes: {
    type: String
  },
  entryMethod: {
    type: String,
    enum: ['qr', 'lpr', 'rfid', 'manual'],
    default: 'qr'
  },
  modifications: [{
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    originalStartTime: Date,
    originalEndTime: Date,
    originalAmount: Number,
    changeReason: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  assignedSpot: {
    floor: Number,
    spotNumber: String,
    section: String
  },
  checkInDeadline: {
    type: Date
  },
  lateCheckIn: {
    type: Boolean,
    default: false
  },
  earlyCheckOut: {
    type: Boolean,
    default: false
  },
  extensionRequested: {
    type: Boolean,
    default: false
  },
  extensionApproved: {
    type: Boolean,
    default: false
  },
  autoCheckout: {
    type: Boolean,
    default: false
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  }
}, {
  timestamps: true
});

// Generate a unique booking code before saving
ParkingBookingSchema.pre('save', function(next) {
  if (!this.bookingCode) {
    // Create a unique booking code format: PRK-YYYYMMDD-XXXXX
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.bookingCode = `PRK-${date}-${random}`;
  }
  
  // Set check-in deadline to 30 minutes after booking start time
  if (!this.checkInDeadline && this.startTime) {
    const deadline = new Date(this.startTime);
    deadline.setMinutes(deadline.getMinutes() + 30);
    this.checkInDeadline = deadline;
  }
  
  next();
});

// Generate QR code for parking entry
ParkingBookingSchema.methods.generateQRCode = function() {
  // In a real application, integrate with a QR code generation service/library
  // For now, we'll just create a placeholder string
  const data = {
    bookingCode: this.bookingCode,
    userId: this.user.toString(),
    vehicleReg: this.vehicleDetails.registrationNumber,
    timestamp: Date.now()
  };
  this.qrCode = Buffer.from(JSON.stringify(data)).toString('base64');
  return this.qrCode;
};

// Calculate duration of parking in hours
ParkingBookingSchema.virtual('durationHours').get(function() {
  const start = new Date(this.startTime);
  const end = new Date(this.endTime);
  return Math.ceil((end - start) / (1000 * 60 * 60));
});

// Calculate duration of parking in days
ParkingBookingSchema.virtual('durationDays').get(function() {
  return Math.ceil(this.durationHours / 24);
});

// Calculate if the booking is eligible for modification
ParkingBookingSchema.virtual('canModify').get(function() {
  const now = new Date();
  const bookingStart = new Date(this.startTime);
  
  // Can modify if booking hasn't started and it's not cancelled
  return now < bookingStart && this.status !== 'cancelled' && this.status !== 'checked-in' && this.status !== 'checked-out';
});

// Calculate if the booking is eligible for cancellation
ParkingBookingSchema.virtual('canCancel').get(function() {
  const now = new Date();
  const bookingStart = new Date(this.startTime);
  
  // Can cancel if booking hasn't started and it's not already cancelled
  return now < bookingStart && this.status !== 'cancelled' && this.status !== 'checked-in' && this.status !== 'checked-out';
});

// Calculate cancellation fee based on how close to start time
ParkingBookingSchema.virtual('cancellationFee').get(function() {
  const now = new Date();
  const bookingStart = new Date(this.startTime);
  const hoursToStart = (bookingStart - now) / (1000 * 60 * 60);
  
  if (hoursToStart >= 24) {
    return 0; // No fee if cancelled 24+ hours before
  } else if (hoursToStart >= 12) {
    return this.amount * 0.25; // 25% fee if cancelled 12-24 hours before
  } else if (hoursToStart >= 2) {
    return this.amount * 0.5; // 50% fee if cancelled 2-12 hours before
  } else {
    return this.amount; // 100% fee (no refund) if cancelled less than 2 hours before
  }
});

// Index for searching bookings
ParkingBookingSchema.index({ user: 1, parkingSpot: 1, startTime: 1 });
ParkingBookingSchema.index({ 'vehicleDetails.registrationNumber': 1 });
ParkingBookingSchema.index({ bookingCode: 1 });
ParkingBookingSchema.index({ status: 1 });

module.exports = mongoose.model('ParkingBooking', ParkingBookingSchema);
