const mongoose = require('mongoose');

const RideServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['cab', 'shuttle', 'e-rickshaw', 'auto'],
      required: true
    },
    vehicleTypes: [{
      type: String,
      enum: ['sedan', 'suv', 'hatchback', 'luxury', 'bike', 'scooter', 'auto'],
      required: true
    }],
    baseFare: {
      type: Number,
      required: true,
      min: 0
    },
    perKilometerRate: {
      type: Number,
      required: true,
      min: 0
    },
    perMinuteRate: {
      type: Number,
      required: true,
      min: 0
    },
    minimumFare: {
      type: Number,
      required: true,
      min: 0
    },
    cancellationFee: {
      type: Number,
      default: 0,
      min: 0
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0
    },
    waitingChargePerMinute: {
      type: Number,
      default: 0,
      min: 0
    },
    surgeMultiplier: {
      type: Number,
      default: 1,
      min: 1
    },
    maxWaitingTime: {
      type: Number, // in minutes
      default: 5,
      min: 1
    },
    commissionPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    features: [{
      type: String,
      enum: ['ac', 'wifi', 'childSeat', 'wheelchair', 'petFriendly', 'luggageSpace']
    }],
    availableLocations: [{
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      },
      specialRates: {
        hasSpecialRates: {
          type: Boolean,
          default: false
        },
        baseFare: Number,
        perKilometerRate: Number,
        perMinuteRate: Number,
        minimumFare: Number
      }
    }],
    maxPassengers: {
      type: Number,
      required: true,
      min: 1
    },
    estimatedTimeCalculation: {
      baseTime: {
        type: Number, // in minutes
        required: true,
        min: 0
      },
      timePerKilometer: {
        type: Number, // in minutes
        required: true,
        min: 0
      },
      trafficMultiplier: {
        type: Number,
        default: 1.2,
        min: 1
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    availabilityTimes: {
      monday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: '00:00' },
        endTime: { type: String, default: '23:59' }
      },
      tuesday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: '00:00' },
        endTime: { type: String, default: '23:59' }
      },
      wednesday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: '00:00' },
        endTime: { type: String, default: '23:59' }
      },
      thursday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: '00:00' },
        endTime: { type: String, default: '23:59' }
      },
      friday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: '00:00' },
        endTime: { type: String, default: '23:59' }
      },
      saturday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: '00:00' },
        endTime: { type: String, default: '23:59' }
      },
      sunday: {
        isAvailable: { type: Boolean, default: true },
        startTime: { type: String, default: '00:00' },
        endTime: { type: String, default: '23:59' }
      }
    },
    icon: {
      type: String
    },
    image: {
      type: String
    },
    promotions: [{
      name: {
        type: String,
        required: true
      },
      description: {
        type: String
      },
      discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
      },
      discountValue: {
        type: Number,
        required: true,
        min: 0
      },
      validFrom: {
        type: Date,
        required: true
      },
      validUntil: {
        type: Date,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      },
      applicableUserTypes: {
        type: [String],
        enum: ['all', 'new', 'existing'],
        default: ['all']
      },
      couponCode: {
        type: String
      },
      maxDiscountAmount: {
        type: Number
      },
      maxUses: {
        type: Number
      },
      usesCount: {
        type: Number,
        default: 0
      }
    }],
    operationalAreas: [{
      type: String,
      trim: true
    }],
    serviceType: {
      type: String,
      enum: ['cab', 'shuttle', 'pool', 'last-mile'],
      required: true
    },
    rideSharing: {
      enabled: {
        type: Boolean,
        default: false
      },
      maxPoolSize: {
        type: Number,
        min: 2,
        max: 6
      },
      poolingRadius: {
        type: Number, // in meters
        min: 100,
        max: 2000
      }
    },
    publicTransportIntegration: {
      enabled: {
        type: Boolean,
        default: false
      },
      nearbyStops: [{
        stopId: String,
        stopName: String,
        distance: Number, // in meters
        transportType: String // bus, train, metro, etc.
      }],
      transferTime: {
        type: Number, // in minutes
        min: 0
      }
    },
    scheduling: {
      advanceBooking: {
        enabled: {
          type: Boolean,
          default: true
        },
        maxAdvanceHours: {
          type: Number,
          default: 24
        },
        minAdvanceMinutes: {
          type: Number,
          default: 15
        }
      },
      recurringBookings: {
        enabled: {
          type: Boolean,
          default: true
        },
        maxRecurringDays: {
          type: Number,
          default: 30
        }
      }
    },
    operatingHours: {
      start: {
        type: String,
        required: true
      },
      end: {
        type: String,
        required: true
      }
    },
    metroStations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MetroStation'
    }],
    isShared: {
      type: Boolean,
      default: false
    },
    maxSharedPassengers: {
      type: Number,
      default: 4
    },
    provider: {
      name: {
        type: String,
        required: true
      },
      contactPhone: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      website: {
        type: String
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for common query patterns
RideServiceSchema.index({ type: 1 });
RideServiceSchema.index({ 'availableLocations.city': 1 });
RideServiceSchema.index({ isActive: 1 });
RideServiceSchema.index({ vehicleTypes: 1 });

// Method to check if service is available at a specific location
RideServiceSchema.methods.isAvailableAt = function(city, state, country) {
  return this.availableLocations.some(
    location => 
      location.isActive &&
      location.city.toLowerCase() === city.toLowerCase() &&
      location.state.toLowerCase() === state.toLowerCase() &&
      location.country.toLowerCase() === country.toLowerCase()
  );
};

// Method to check if service is available at a specific time
RideServiceSchema.methods.isAvailableAtTime = function(day, time) {
  const dayLower = day.toLowerCase();
  const availableDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  if (!availableDays.includes(dayLower)) {
    return false;
  }
  
  const daySchedule = this.availabilityTimes[dayLower];
  
  if (!daySchedule.isAvailable) {
    return false;
  }
  
  const currentTime = time || new Date().toTimeString().slice(0, 5);
  return currentTime >= daySchedule.startTime && currentTime <= daySchedule.endTime;
};

// Method to calculate fare estimate
RideServiceSchema.methods.calculateFareEstimate = function(distanceInKm, durationInMinutes, city, state, country) {
  // Check if there are special rates for the location
  let baseFare = this.baseFare;
  let perKilometerRate = this.perKilometerRate;
  let perMinuteRate = this.perMinuteRate;
  let minimumFare = this.minimumFare;
  
  const location = this.availableLocations.find(
    loc => 
      loc.city.toLowerCase() === city.toLowerCase() &&
      loc.state.toLowerCase() === state.toLowerCase() &&
      loc.country.toLowerCase() === country.toLowerCase()
  );
  
  if (location && location.specialRates && location.specialRates.hasSpecialRates) {
    baseFare = location.specialRates.baseFare || baseFare;
    perKilometerRate = location.specialRates.perKilometerRate || perKilometerRate;
    perMinuteRate = location.specialRates.perMinuteRate || perMinuteRate;
    minimumFare = location.specialRates.minimumFare || minimumFare;
  }
  
  // Calculate fare components
  const distanceFare = distanceInKm * perKilometerRate;
  const timeFare = durationInMinutes * perMinuteRate;
  const totalFare = baseFare + distanceFare + timeFare;
  
  // Apply surge pricing
  const surgedFare = totalFare * this.surgeMultiplier;
  
  // Apply service fee
  const finalFare = surgedFare + this.serviceFee;
  
  // Ensure the fare is at least the minimum fare
  return Math.max(finalFare, minimumFare);
};

// Static method to find available services by location and vehicle type
RideServiceSchema.statics.findAvailableServices = function(city, state, country, vehicleType) {
  const query = {
    isActive: true,
    'availableLocations': {
      $elemMatch: {
        city: new RegExp(city, 'i'),
        state: new RegExp(state, 'i'),
        country: new RegExp(country, 'i'),
        isActive: true
      }
    }
  };
  
  if (vehicleType) {
    query.vehicleTypes = vehicleType;
  }
  
  return this.find(query);
};

// Update the updatedAt timestamp before saving
RideServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RideService', RideServiceSchema);
