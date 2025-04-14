const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  vehicleDetails: [{
    model: String,
    color: String,
    registrationNumber: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['car', 'motorcycle', 'truck', 'van', 'other'],
      default: 'car'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['credit', 'debit', 'upi', 'wallet']
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  rfidTag: {
    tagId: {
      type: String,
      unique: true,
      sparse: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    assignedOn: {
      type: Date
    }
  },
  preferences: {
    parkingType: {
      type: String,
      enum: ['covered', 'open', 'multi-level'],
      default: 'covered'
    },
    preferredPaymentMethod: {
      type: String,
      enum: ['credit', 'debit', 'upi', 'wallet'],
      default: 'credit'
    },
    preferredEntryMethod: {
      type: String,
      enum: ['qr', 'lpr', 'rfid'],
      default: 'qr'
    },
    receiveNotifications: {
      type: Boolean,
      default: true
    },
    autoCheckout: {
      type: Boolean,
      default: false
    },
    saveParkedLocation: {
      type: Boolean,
      default: true
    }
  },
  frequentLocations: [{
    name: String,
    parkingSpotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSpot'
    },
    visitCount: {
      type: Number,
      default: 1
    },
    lastVisited: Date
  }],
  loyaltyPoints: {
    points: {
      type: Number,
      default: 0
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    pointsHistory: [{
      points: Number,
      reason: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { user: { id: this._id, role: this.role } },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate loyalty tier based on points
UserSchema.methods.calculateLoyaltyTier = function() {
  const points = this.loyaltyPoints.points;
  
  if (points >= 1000) {
    this.loyaltyPoints.tier = 'platinum';
  } else if (points >= 500) {
    this.loyaltyPoints.tier = 'gold';
  } else if (points >= 200) {
    this.loyaltyPoints.tier = 'silver';
  } else {
    this.loyaltyPoints.tier = 'bronze';
  }
  
  return this.loyaltyPoints.tier;
};

// Get discount percentage based on loyalty tier
UserSchema.methods.getLoyaltyDiscount = function() {
  const tier = this.loyaltyPoints.tier;
  
  switch (tier) {
    case 'platinum':
      return 0.15; // 15% discount
    case 'gold':
      return 0.10; // 10% discount
    case 'silver':
      return 0.05; // 5% discount
    default:
      return 0; // No discount
  }
};

// Index for searching users
UserSchema.index({ email: 1 });
UserSchema.index({ 'vehicleDetails.registrationNumber': 1 });
UserSchema.index({ 'rfidTag.tagId': 1 });

module.exports = mongoose.model('User', UserSchema);
