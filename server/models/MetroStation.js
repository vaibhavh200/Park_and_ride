const mongoose = require('mongoose');

const MetroStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a station name'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Please provide a station code'],
    unique: true,
    trim: true
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  lines: [{
    type: String,
    required: true
  }],
  hasParking: {
    type: Boolean,
    default: false
  },
  hasLastMileConnectivity: {
    type: Boolean,
    default: false
  },
  amenities: [{
    type: String,
    enum: ['restrooms', 'elevator', 'escalator', 'food-court', 'wifi', 'atm', 'disabled-access']
  }],
  operatingHours: {
    openTime: String,
    closeTime: String,
    is24Hours: {
      type: Boolean,
      default: false
    }
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for location-based searches
MetroStationSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual to get associated parking spots
MetroStationSchema.virtual('parkingSpots', {
  ref: 'ParkingSpot',
  localField: '_id',
  foreignField: 'metroStation',
  justOne: false
});

// Static method to find metro stations near a location
MetroStationSchema.statics.findNearby = async function(longitude, latitude, maxDistance = 5000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    }
  });
};

module.exports = mongoose.model('MetroStation', MetroStationSchema);
