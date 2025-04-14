const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Ride must belong to a user']
  },
  rideType: {
    type: String,
    enum: ['cab', 'shuttle', 'e-rickshaw', 'bike', 'scooter'],
    required: [true, 'Ride type is required']
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Ride must have a driver']
  },
  vehicle: {
    type: {
      type: String,
      enum: ['car', 'van', 'e-rickshaw', 'bike', 'scooter'],
      required: [true, 'Vehicle type is required']
    },
    model: String,
    licensePlate: String,
    color: String
  },
  isShared: {
    type: Boolean,
    default: false
  },
  pickupLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    name: String
  },
  dropLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    name: String
  },
  pickupTime: {
    type: Date,
    required: [true, 'Pickup time is required']
  },
  estimatedDropTime: Date,
  actualDropTime: Date,
  fare: {
    baseAmount: Number,
    tax: Number,
    totalAmount: {
      type: Number,
      required: [true, 'Total fare amount is required']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet'],
      default: 'cash'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  route: {
    distance: Number, // in kilometers
    estimatedDuration: Number, // in minutes
    actualDuration: Number, // in minutes
    path: [{
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      timestamp: Date
    }]
  },
  status: {
    type: String,
    enum: ['scheduled', 'driver-assigned', 'driver-arrived', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  rating: {
    user: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      createdAt: Date
    },
    driver: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      review: String,
      createdAt: Date
    }
  },
  metroStation: {
    type: mongoose.Schema.ObjectId,
    ref: 'MetroStation',
    required: [true, 'Ride must be associated with a metro station']
  },
  relatedParkingBooking: {
    type: mongoose.Schema.ObjectId,
    ref: 'ParkingBooking'
  },
  cancellationInfo: {
    cancelledBy: {
      type: String,
      enum: ['user', 'driver', 'system']
    },
    cancelledAt: Date,
    reason: String,
    cancellationFee: Number
  },
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for geospatial queries and efficient joins
rideSchema.index({ pickupLocation: '2dsphere' });
rideSchema.index({ dropLocation: '2dsphere' });
rideSchema.index({ user: 1, createdAt: -1 });
rideSchema.index({ driver: 1, status: 1 });
rideSchema.index({ metroStation: 1, pickupTime: 1 });

// Methods for fare calculation
rideSchema.methods.calculateFare = function(distance, duration, rideType, isShared) {
  // Base fare calculation logic
  let baseFare = 0;
  const perKmRate = rideType === 'cab' ? 10 : 
                    rideType === 'shuttle' ? 5 : 
                    rideType === 'e-rickshaw' ? 7 : 3;
  
  baseFare = 30 + (distance * perKmRate);
  
  // Apply shared ride discount if applicable
  if (isShared) {
    baseFare *= 0.7; // 30% discount for shared rides
  }
  
  // Calculate tax (assuming 5% tax)
  const tax = baseFare * 0.05;
  
  // Calculate total fare
  const totalFare = baseFare + tax;
  
  return {
    baseAmount: baseFare,
    tax: tax,
    totalAmount: totalFare
  };
};

// Static method to find available drivers
rideSchema.statics.findAvailableDrivers = async function(metroStationId, pickupTime, rideType) {
  // Logic to find available drivers near the metro station
  // This would typically involve querying a separate driver availability collection
  // or implementing a more complex algorithm based on real-time driver locations
  
  // For this model, we'll return a simplified implementation
  const User = mongoose.model('User');
  const drivers = await User.find({
    role: 'driver',
    // Additional criteria for driver availability would go here
  }).limit(5);
  
  return drivers;
};

const Ride = mongoose.model('Ride', rideSchema);
module.exports = Ride; 