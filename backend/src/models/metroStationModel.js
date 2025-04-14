const mongoose = require('mongoose');

const metroStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Metro station name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Station code is required'],
    trim: true,
    unique: true
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
  lines: [String],
  facilities: [String],
  operatingHours: {
    open: String,
    close: String
  },
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
metroStationSchema.index({ location: '2dsphere' });

// Virtual populate for nearby parking lots
metroStationSchema.virtual('parkingLots', {
  ref: 'ParkingLot',
  foreignField: 'nearbyMetro',
  localField: '_id'
});

const MetroStation = mongoose.model('MetroStation', metroStationSchema);
module.exports = MetroStation; 