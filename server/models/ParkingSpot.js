const mongoose = require('mongoose');
const geojson = require('mongoose-geojson-schema');

const ParkingSpotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the parking spot'],
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
  metroStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MetroStation',
    required: true
  },
  totalSpots: {
    type: Number,
    required: [true, 'Please specify the total number of parking spots']
  },
  availableSpots: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['covered', 'open', 'multi-level'],
    required: true
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Please provide the hourly rate']
  },
  dailyRate: {
    type: Number,
    required: [true, 'Please provide the daily rate']
  },
  monthlyRate: {
    type: Number,
    required: [true, 'Please provide the monthly rate']
  },
  amenities: [{
    type: String,
    enum: ['electric-charging', 'cctv', 'security-guard', 'car-wash', 'disabled-access', 'wifi']
  }],
  operatingHours: {
    openTime: String,
    closeTime: String,
    is24Hours: {
      type: Boolean,
      default: false
    }
  },
  images: [String],
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  active: {
    type: Boolean,
    default: true
  },
  entrySystem: {
    hasLPR: {
      type: Boolean,
      default: false
    },
    hasRFID: {
      type: Boolean,
      default: false
    },
    hasQRScanner: {
      type: Boolean,
      default: true
    },
    autoEntry: {
      type: Boolean,
      default: false
    }
  },
  parkingLayout: {
    floors: {
      type: Number,
      default: 1
    },
    spotsPerFloor: [Number],
    hasDedicatedSpots: {
      type: Boolean,
      default: false
    },
    hasHandicappedSpots: {
      type: Boolean,
      default: true
    },
    hasEVSpots: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for location-based searches
ParkingSpotSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for calculating occupancy rate
ParkingSpotSchema.virtual('occupancyRate').get(function() {
  if (this.totalSpots === 0) return 0;
  return ((this.totalSpots - this.availableSpots) / this.totalSpots) * 100;
});

// Static method to find parking spots near a location
ParkingSpotSchema.statics.findNearby = async function(longitude, latitude, maxDistance = 5000) {
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

module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema);
