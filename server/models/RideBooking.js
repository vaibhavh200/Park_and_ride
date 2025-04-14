const mongoose = require('mongoose');
const crypto = require('crypto');
const QRCode = require('qrcode');

const RideBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: false
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rideService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RideService',
    required: true
  },
  bookingNumber: {
    type: String,
    unique: true
  },
  pickupLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  dropoffLocation: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  },
  pickupTime: {
    type: Date,
    required: true
  },
  estimatedDropoffTime: {
    type: Date
  },
  actualPickupTime: {
    type: Date
  },
  actualDropoffTime: {
    type: Date
  },
  distance: {
    type: Number, // in kilometers
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  actualDuration: {
    type: Number // in minutes
  },
  status: {
    type: String,
    enum: [
      'pending', 
      'confirmed', 
      'driver-assigned', 
      'en-route', 
      'arrived', 
      'in-progress', 
      'completed', 
      'cancelled', 
      'missed'
    ],
    default: 'pending'
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'driver', 'admin', 'system']
  },
  cancellationReason: {
    type: String
  },
  cancellationTime: {
    type: Date
  },
  fare: {
    baseFare: {
      type: Number,
      required: true
    },
    distanceFare: {
      type: Number,
      required: true
    },
    timeFare: {
      type: Number,
      required: true
    },
    waitingFare: {
      type: Number,
      default: 0
    },
    surgeFare: {
      type: Number,
      default: 0
    },
    promoDiscount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially-refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit', 'debit', 'credit-card', 'debit-card', 'paypal', 'wallet', 'cash', 'other'],
    required: true
  },
  paymentDetails: {
    transactionId: String,
    paymentTime: Date,
    receiptUrl: String
  },
  promoCodeApplied: {
    code: String,
    discountAmount: Number
  },
  numberOfPassengers: {
    type: Number,
    required: true,
    min: 1
  },
  specialRequirements: [{
    type: String,
    enum: ['wheelchair', 'childSeat', 'petFriendly', 'extraLuggage', 'assistanceRequired']
  }],
  rating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  driverRating: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  notes: {
    type: String
  },
  trackingInfo: [{
    status: {
      type: String,
      enum: [
        'driver-assigned', 
        'en-route', 
        'arrived', 
        'waiting', 
        'picked-up', 
        'in-progress', 
        'near-destination', 
        'arrived-destination', 
        'completed'
      ]
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  waitTime: {
    started: Date,
    ended: Date,
    totalMinutes: {
      type: Number,
      default: 0
    }
  },
  qrCode: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes
RideBookingSchema.index({ user: 1 });
RideBookingSchema.index({ driver: 1 });
RideBookingSchema.index({ vehicle: 1 });
RideBookingSchema.index({ status: 1 });
RideBookingSchema.index({ bookingNumber: 1 });
RideBookingSchema.index({ 'pickupLocation.coordinates': '2dsphere' });
RideBookingSchema.index({ 'dropoffLocation.coordinates': '2dsphere' });
RideBookingSchema.index({ pickupTime: 1 });

// Create the booking number before saving
RideBookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const prefix = 'RIDE';
    const timestamp = Math.floor(Date.now() / 1000).toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingNumber = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Method to calculate additional waiting charges
RideBookingSchema.methods.calculateWaitingCharges = async function(waitingTimeInMinutes, rideServiceId) {
  if (!waitingTimeInMinutes || waitingTimeInMinutes <= 0) {
    return 0;
  }

  // Fetch the ride service to get the waiting charge rate
  const RideService = mongoose.model('RideService');
  const rideService = await RideService.findById(rideServiceId);
  
  if (!rideService) {
    throw new Error('Ride service not found');
  }
  
  // Calculate waiting charges
  const waitingCharges = waitingTimeInMinutes * rideService.waitingChargePerMinute;
  
  // Update the fare
  this.fare.waitingFare = waitingCharges;
  this.fare.total = this.fare.total + waitingCharges;
  
  // Update the wait time record
  this.waitTime.totalMinutes = waitingTimeInMinutes;
  
  return waitingCharges;
};

// Method to update booking status with tracking information
RideBookingSchema.methods.updateStatus = function(status, location, note) {
  this.status = status;
  
  // Add to tracking info
  const trackingEntry = {
    status,
    timestamp: new Date()
  };
  
  if (location && location.coordinates) {
    trackingEntry.location = {
      type: 'Point',
      coordinates: location.coordinates
    };
  }
  
  if (note) {
    trackingEntry.note = note;
  }
  
  this.trackingInfo.push(trackingEntry);
  
  // Handle specific status changes
  switch (status) {
    case 'arrived':
      this.waitTime.started = new Date();
      break;
    case 'picked-up':
      if (this.waitTime.started) {
        this.waitTime.ended = new Date();
        const waitMinutes = Math.ceil((this.waitTime.ended - this.waitTime.started) / (1000 * 60));
        this.waitTime.totalMinutes = waitMinutes;
      }
      this.actualPickupTime = new Date();
      break;
    case 'completed':
      this.actualDropoffTime = new Date();
      if (this.actualPickupTime) {
        this.actualDuration = Math.ceil((this.actualDropoffTime - this.actualPickupTime) / (1000 * 60));
      }
      break;
    case 'cancelled':
      // Cancellation handling is done in a separate method
      break;
  }
  
  return this;
};

// Method to cancel a booking
RideBookingSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  this.cancellationTime = new Date();
  
  // Add to tracking info
  this.trackingInfo.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: `Cancelled by ${cancelledBy}: ${reason}`
  });
  
  return this;
};

// Method to add a rating
RideBookingSchema.methods.addRating = function(rating, comment) {
  this.rating = {
    value: rating,
    comment: comment,
    createdAt: new Date()
  };
  
  return this;
};

// Method to add a driver rating
RideBookingSchema.methods.addDriverRating = function(rating, comment) {
  this.driverRating = {
    value: rating,
    comment: comment,
    createdAt: new Date()
  };
  
  return this;
};

// Static method to find nearby drivers
RideBookingSchema.statics.findNearbyDrivers = function(coordinates, maxDistance = 5000, status = 'en-route') {
  return this.find({
    status: status,
    'trackingInfo.location': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance // in meters
      }
    }
  }).populate('driver vehicle');
};

// Static method to find user's active bookings
RideBookingSchema.statics.findActiveBookings = function(userId) {
  return this.find({
    user: userId,
    status: { 
      $in: ['confirmed', 'driver-assigned', 'en-route', 'arrived', 'in-progress'] 
    }
  }).sort({ pickupTime: 1 });
};

// Static method to find upcoming bookings for a driver
RideBookingSchema.statics.findDriverUpcomingBookings = function(driverId) {
  return this.find({
    driver: driverId,
    status: { 
      $in: ['driver-assigned', 'en-route', 'arrived', 'in-progress'] 
    }
  }).sort({ pickupTime: 1 });
};

module.exports = mongoose.model('RideBooking', RideBookingSchema);
