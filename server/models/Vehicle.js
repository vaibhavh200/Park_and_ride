const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['sedan', 'hatchback', 'suv', 'auto']
  },
  capacity: {
    type: Number,
    required: true
  },
  features: [{
    type: String,
    enum: ['ac', 'music', 'wifi', 'childSeat']
  }],
  fuelType: {
    type: String,
    required: true,
    enum: ['petrol', 'diesel', 'electric', 'cng']
  },
  transmissionType: {
    type: String,
    required: true,
    enum: ['manual', 'automatic']
  },
  registrationDate: {
    type: Date,
    required: true
  },
  insuranceDetails: {
    policyNumber: String,
    provider: String,
    validUntil: Date
  },
  inspectionStatus: {
    lastInspectionDate: Date,
    nextInspectionDue: Date,
    status: {
      type: String,
      enum: ['passed', 'failed', 'pending']
    }
  },
  documents: {
    registrationCertificate: {
      url: String,
      verified: Boolean
    },
    insurance: {
      url: String,
      verified: Boolean
    },
    pollutionCertificate: {
      url: String,
      verified: Boolean,
      validUntil: Date
    }
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  assignedRideService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RideService'
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  maintenanceRecords: [{
    date: Date,
    description: String,
    odometer: Number,
    cost: Number,
    nextMaintenanceDue: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
vehicleSchema.index({ currentLocation: '2dsphere' });
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ isAvailable: 1 });

// Update the updatedAt timestamp before saving
vehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema); 