const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Parking spot number is required'],
    unique: true
  },
  isOccupied: {
    type: Boolean,
    default: false
  },
  isReserved: {
    type: Boolean,
    default: false
  },
  floor: {
    type: Number,
    required: [true, 'Floor number is required']
  },
  type: {
    type: String,
    enum: ['standard', 'handicapped', 'electric-vehicle', 'premium'],
    default: 'standard'
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    description: String
  }
});

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Parking lot name is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number]
  },
  totalSpots: {
    type: Number,
    required: [true, 'Total number of spots is required']
  },
  availableSpots: {
    type: Number,
    default: function() {
      return this.totalSpots;
    }
  },
  nearbyMetro: {
    type: mongoose.Schema.ObjectId,
    ref: 'MetroStation',
    required: [true, 'A parking lot must be associated with a metro station']
  },
  operatingHours: {
    open: String,
    close: String
  },
  pricing: {
    hourly: Number,
    daily: Number,
    monthly: Number
  },
  amenities: [String],
  spots: [parkingSpotSchema],
  active: {
    type: Boolean,
    default: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true
});

// Create indexes for location-based searches
parkingLotSchema.index({ location: '2dsphere' });

// Virtual populate for bookings related to this parking lot
parkingLotSchema.virtual('bookings', {
  ref: 'ParkingBooking',
  foreignField: 'parkingLot',
  localField: '_id'
});

// Instance method to find available parking spots
parkingLotSchema.methods.findAvailableSpots = function(startTime, endTime) {
  // Logic to find available spots based on time range
  return this.spots.filter(spot => !spot.isOccupied && !spot.isReserved);
};

const ParkingLot = mongoose.model('ParkingLot', parkingLotSchema);
module.exports = ParkingLot; 