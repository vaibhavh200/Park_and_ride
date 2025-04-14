const Ride = require('../models/rideModel');
const User = require('../models/userModel');
const MetroStation = require('../models/metroStationModel');

// Get available ride types
exports.getRideTypes = async (req, res) => {
  try {
    const rideTypes = [
      {
        type: 'cab',
        name: 'Private Cab',
        description: 'Book a private cab for your journey',
        icon: 'car',
        basePrice: 100,
        perKmPrice: 10
      },
      {
        type: 'shuttle',
        name: 'Shuttle Bus',
        description: 'Shared shuttle service with multiple stops',
        icon: 'bus',
        basePrice: 50,
        perKmPrice: 5
      },
      {
        type: 'e-rickshaw',
        name: 'E-Rickshaw',
        description: 'Eco-friendly last-mile connectivity',
        icon: 'rickshaw',
        basePrice: 30,
        perKmPrice: 7
      },
      {
        type: 'bike',
        name: 'Bike Taxi',
        description: 'Quick and easy way to navigate traffic',
        icon: 'motorcycle',
        basePrice: 20,
        perKmPrice: 8
      },
      {
        type: 'scooter',
        name: 'Rental Scooter',
        description: 'Self-drive electric scooter for short distances',
        icon: 'scooter',
        basePrice: 15,
        perKmPrice: 3
      }
    ];
    
    res.status(200).json({
      status: 'success',
      data: {
        rideTypes
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Estimate ride fare
exports.estimateFare = async (req, res) => {
  try {
    const { rideType, distance, isShared } = req.body;
    
    if (!rideType || !distance) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide rideType and distance'
      });
    }
    
    // Create a temporary ride object to use the model's calculation method
    const tempRide = new Ride({
      rideType,
      isShared: isShared || false
    });
    
    // Calculate estimated duration (approximate 2 mins per km)
    const estimatedDuration = distance * 2;
    
    // Use the model's method to calculate fare
    const fareDetails = tempRide.calculateFare(distance, estimatedDuration, rideType, isShared || false);
    
    res.status(200).json({
      status: 'success',
      data: {
        fareEstimate: {
          ...fareDetails,
          distance,
          estimatedDuration,
          rideType,
          isShared: isShared || false
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Find available drivers
exports.findAvailableDrivers = async (req, res) => {
  try {
    const { metroStationId, rideType, pickupTime } = req.body;
    
    if (!metroStationId || !rideType) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide metroStationId and rideType'
      });
    }
    
    // Check if metro station exists
    const metroStation = await MetroStation.findById(metroStationId);
    if (!metroStation) {
      return res.status(404).json({
        status: 'fail',
        message: 'Metro station not found'
      });
    }
    
    // Use the static method from the model to find available drivers
    const drivers = await Ride.findAvailableDrivers(metroStationId, pickupTime, rideType);
    
    res.status(200).json({
      status: 'success',
      results: drivers.length,
      data: {
        drivers
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Book a ride
exports.bookRide = async (req, res) => {
  try {
    const {
      rideType,
      pickupLocation,
      dropLocation,
      pickupTime,
      isShared,
      metroStationId,
      parkingBookingId,
      driverId
    } = req.body;
    
    // Validation
    if (!rideType || !pickupLocation || !dropLocation || !pickupTime || !metroStationId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required ride information'
      });
    }
    
    // Check if metro station exists
    const metroStation = await MetroStation.findById(metroStationId);
    if (!metroStation) {
      return res.status(404).json({
        status: 'fail',
        message: 'Metro station not found'
      });
    }
    
    // Check if driver exists (if provided)
    let driver;
    if (driverId) {
      driver = await User.findOne({ _id: driverId, role: 'driver' });
      if (!driver) {
        return res.status(404).json({
          status: 'fail',
          message: 'Driver not found'
        });
      }
    } else {
      // Auto-assign a driver
      const availableDrivers = await Ride.findAvailableDrivers(metroStationId, pickupTime, rideType);
      if (availableDrivers.length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'No drivers available for this ride'
        });
      }
      driver = availableDrivers[0];
    }
    
    // Calculate distance and duration (normally would use a maps API)
    // For demo, using simplified calculation based on coordinates
    const distance = calculateDistance(
      pickupLocation.coordinates[1], 
      pickupLocation.coordinates[0], 
      dropLocation.coordinates[1], 
      dropLocation.coordinates[0]
    );
    
    const estimatedDuration = distance * 2; // 2 minutes per km
    
    // Create a new ride instance
    const newRide = new Ride({
      user: req.user._id,
      rideType,
      driver: driver._id,
      vehicle: {
        type: rideType === 'cab' ? 'car' : 
              rideType === 'shuttle' ? 'van' : 
              rideType === 'e-rickshaw' ? 'e-rickshaw' : 
              rideType,
        // Simulated vehicle details - in a real app, would come from driver profile
        model: 'Model X',
        licensePlate: 'XYZ-1234',
        color: 'White'
      },
      isShared: isShared || false,
      pickupLocation,
      dropLocation,
      pickupTime: new Date(pickupTime),
      estimatedDropTime: new Date(new Date(pickupTime).getTime() + estimatedDuration * 60000),
      route: {
        distance,
        estimatedDuration,
        path: [] // Would be populated by actual route coordinates in a real app
      },
      metroStation: metroStationId,
      relatedParkingBooking: parkingBookingId || null,
      status: 'scheduled'
    });
    
    // Calculate fare
    const fareDetails = newRide.calculateFare(distance, estimatedDuration, rideType, isShared || false);
    newRide.fare = {
      baseAmount: fareDetails.baseAmount,
      tax: fareDetails.tax,
      totalAmount: fareDetails.totalAmount,
      paymentMethod: 'cash', // Default payment method
      paymentStatus: 'pending'
    };
    
    // Save the ride
    await newRide.save();
    
    res.status(201).json({
      status: 'success',
      data: {
        ride: newRide
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get user rides
exports.getUserRides = async (req, res) => {
  try {
    const rides = await Ride.find({ user: req.user._id })
      .populate('driver', 'name phoneNumber')
      .populate('metroStation', 'name code')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: rides.length,
      data: {
        rides
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Get a single ride by ID
exports.getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name phoneNumber')
      .populate('metroStation', 'name code address')
      .populate('relatedParkingBooking');
    
    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found'
      });
    }
    
    // Check if the ride belongs to the user or user is admin or the driver
    if (
      ride.user.toString() !== req.user._id.toString() && 
      ride.driver._id.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to view this ride'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        ride
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Cancel ride
exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found'
      });
    }
    
    // Check if the ride belongs to the user or user is admin or the driver
    const isAuthorized = 
      ride.user.toString() === req.user._id.toString() || 
      ride.driver.toString() === req.user._id.toString() || 
      req.user.role === 'admin';
      
    if (!isAuthorized) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to cancel this ride'
      });
    }
    
    // Check if ride can be cancelled (not already completed or cancelled)
    if (ride.status === 'completed' || ride.status === 'cancelled') {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot cancel ride in '${ride.status}' status`
      });
    }
    
    // Determine who cancelled
    const cancelledBy = 
      ride.user.toString() === req.user._id.toString() ? 'user' : 
      ride.driver.toString() === req.user._id.toString() ? 'driver' : 'system';
    
    // Calculate cancellation fee if applicable
    let cancellationFee = 0;
    
    if (cancelledBy === 'user') {
      const now = new Date();
      const pickupTime = new Date(ride.pickupTime);
      const minutesBeforePickup = (pickupTime - now) / (1000 * 60);
      
      if (minutesBeforePickup < 30) {
        // Less than 30 mins before pickup time, charge 50% of base fare
        cancellationFee = ride.fare.baseAmount * 0.5;
      } else if (minutesBeforePickup < 60) {
        // Less than 60 mins but more than 30 mins, charge 25% of base fare
        cancellationFee = ride.fare.baseAmount * 0.25;
      }
      // No fee if cancelled more than 60 mins before pickup
    }
    
    // Update ride
    ride.status = 'cancelled';
    ride.cancellationInfo = {
      cancelledBy,
      cancelledAt: new Date(),
      reason: req.body.reason || `Cancelled by ${cancelledBy}`,
      cancellationFee
    };
    
    await ride.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        ride
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Update ride status (for drivers)
exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['driver-assigned', 'driver-arrived', 'in-progress', 'completed'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid status'
      });
    }
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found'
      });
    }
    
    // Check if the user is the driver or admin
    if (ride.driver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to update this ride'
      });
    }
    
    // Check if status update is valid based on current status
    const currentStatus = ride.status;
    
    const validStatusFlow = {
      'scheduled': ['driver-assigned', 'cancelled'],
      'driver-assigned': ['driver-arrived', 'cancelled'],
      'driver-arrived': ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled']
    };
    
    if (!validStatusFlow[currentStatus]?.includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot update from '${currentStatus}' to '${status}'`
      });
    }
    
    // Update ride status
    ride.status = status;
    
    // Additional updates based on status
    if (status === 'in-progress') {
      // Record actual pickup time
      ride.actualPickupTime = new Date();
    } else if (status === 'completed') {
      // Record actual drop time
      ride.actualDropTime = new Date();
      // Calculate actual duration
      if (ride.actualPickupTime) {
        const durationMinutes = (new Date() - new Date(ride.actualPickupTime)) / (1000 * 60);
        ride.route.actualDuration = durationMinutes;
      }
    }
    
    await ride.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        ride
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Submit rating for a ride
exports.rateRide = async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid rating (1-5)'
      });
    }
    
    const ride = await Ride.findById(req.params.id);
    
    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found'
      });
    }
    
    // Determine if rating is from user or driver
    const isUser = ride.user.toString() === req.user._id.toString();
    const isDriver = ride.driver.toString() === req.user._id.toString();
    
    if (!isUser && !isDriver) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to rate this ride'
      });
    }
    
    // Check if ride is completed
    if (ride.status !== 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'Can only rate completed rides'
      });
    }
    
    // Update the appropriate rating
    if (isUser) {
      ride.rating.driver = {
        rating,
        review: review || '',
        createdAt: new Date()
      };
    } else if (isDriver) {
      ride.rating.user = {
        rating,
        review: review || '',
        createdAt: new Date()
      };
    }
    
    await ride.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        ride
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
} 