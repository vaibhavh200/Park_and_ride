const RideService = require('../models/RideService');
const RideBooking = require('../models/RideBooking');
const MetroStation = require('../models/MetroStation');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const QRCode = require('qrcode');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Add this function to seed ride services if none exist
const seedRideServices = async () => {
  try {
    // Check if ride services already exist
    const servicesCount = await RideService.countDocuments();
    if (servicesCount > 0) {
      console.log('Ride services already exist in the database');
      return;
    }

    // Get a metro station to link to
    const metroStation = await MetroStation.findOne();
    if (!metroStation) {
      console.log('No metro stations found. Cannot seed ride services.');
      return;
    }

    const sampleRideServices = [
      {
        name: 'QuickRide Compact',
        type: 'cab',
        provider: {
          name: 'QuickRide',
          contactPhone: '1800-123-4567',
          email: 'support@quickride.com',
          website: 'www.quickride.com'
        },
        metroStations: [metroStation._id],
        basePrice: 100,
        pricePerKm: 10,
        minWaitTime: 5,
        maxDistance: 15,
        capacity: 4,
        isShared: false,
        amenities: ['air-conditioned', 'charging-ports'],
        operatingHours: {
          openTime: '06:00',
          closeTime: '23:00',
          is24Hours: false
        },
        active: true
      },
      {
        name: 'CityRides Sedan',
        type: 'cab',
        provider: {
          name: 'CityRides',
          contactPhone: '1800-987-6543',
          email: 'info@cityrides.com',
          website: 'www.cityrides.com'
        },
        metroStations: [metroStation._id],
        basePrice: 150,
        pricePerKm: 12,
        minWaitTime: 7,
        maxDistance: 20,
        capacity: 4,
        isShared: false,
        amenities: ['air-conditioned', 'wifi', 'charging-ports'],
        operatingHours: {
          openTime: '05:00',
          closeTime: '23:30',
          is24Hours: false
        },
        active: true
      },
      {
        name: 'MetroShuttle',
        type: 'shuttle',
        provider: {
          name: 'MetroShuttle',
          contactPhone: '1800-456-7890',
          email: 'bookings@metroshuttle.com',
          website: 'www.metroshuttle.com'
        },
        metroStations: [metroStation._id],
        basePrice: 40,
        pricePerKm: 5,
        minWaitTime: 10,
        maxDistance: 12,
        capacity: 12,
        isShared: true,
        amenities: ['air-conditioned'],
        operatingHours: {
          openTime: '07:00',
          closeTime: '21:00',
          is24Hours: false
        },
        active: true
      },
      {
        name: 'EcoRickshaw',
        type: 'e-rickshaw',
        provider: {
          name: 'GreenRide',
          contactPhone: '1800-345-6789',
          email: 'contact@greenride.com'
        },
        metroStations: [metroStation._id],
        basePrice: 30,
        pricePerKm: 7,
        minWaitTime: 5,
        maxDistance: 5,
        capacity: 3,
        isShared: false,
        operatingHours: {
          openTime: '06:00',
          closeTime: '20:00',
          is24Hours: false
        },
        active: true
      }
    ];

    // Insert the sample ride services
    await RideService.insertMany(sampleRideServices);
    console.log('Sample ride services have been added to the database');
  } catch (error) {
    console.error('Error seeding ride services:', error);
  }
};

// Add this function to seed vehicles if none exist
const seedVehicles = async () => {
  try {
    // Check if vehicles already exist
    const vehiclesCount = await Vehicle.countDocuments();
    if (vehiclesCount > 0) {
      console.log('Vehicles already exist in the database');
      return;
    }

    // Get an admin user to assign as the driver
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Using a regular user.');
    }
    
    // Find a user to assign as driver if no admin
    const driver = adminUser || await User.findOne();
    if (!driver) {
      console.log('No users found. Cannot seed vehicles.');
      return;
    }

    // Get ride services to associate with vehicles
    const rideServices = await RideService.find();
    if (rideServices.length === 0) {
      console.log('No ride services found. Please seed ride services first.');
      return;
    }

    // Map to associate vehicle types with ride service types
    const serviceTypeMap = {
      'cab': ['sedan', 'suv', 'hatchback'],
      'shuttle': ['suv'],
      'e-rickshaw': ['auto']
    };

    const sampleVehicles = [];

    // Create vehicles for each ride service
    for (const service of rideServices) {
      const vehicleTypes = serviceTypeMap[service.type] || ['sedan'];
      const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      
      const vehicle = {
        driver: driver._id,
        make: service.type === 'cab' ? 'Toyota' : (service.type === 'shuttle' ? 'Tata' : 'Bajaj'),
        model: service.type === 'cab' ? 'Corolla' : (service.type === 'shuttle' ? 'Winger' : 'RE'),
        year: 2022,
        color: ['White', 'Black', 'Silver', 'Blue'][Math.floor(Math.random() * 4)],
        licensePlate: `MH${Math.floor(Math.random() * 99)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${1000 + Math.floor(Math.random() * 9000)}`,
        vehicleType,
        capacity: service.type === 'cab' ? 4 : (service.type === 'shuttle' ? 12 : 3),
        features: service.type === 'cab' ? ['ac', 'wifi'] : (service.type === 'shuttle' ? ['ac'] : []),
        fuelType: service.type === 'e-rickshaw' ? 'electric' : ['petrol', 'diesel', 'cng'][Math.floor(Math.random() * 3)],
        transmissionType: service.type === 'cab' ? 'automatic' : 'manual',
        registrationDate: new Date(2021, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        insuranceDetails: {
          policyNumber: `INS-${Math.floor(Math.random() * 10000)}`,
          provider: ['ICICI Lombard', 'HDFC ERGO', 'Bajaj Allianz'][Math.floor(Math.random() * 3)],
          validUntil: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        },
        inspectionStatus: {
          lastInspectionDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          nextInspectionDue: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          status: 'passed'
        },
        documents: {
          registrationCertificate: {
            url: 'https://example.com/reg-cert.pdf',
            verified: true
          },
          insurance: {
            url: 'https://example.com/insurance.pdf',
            verified: true
          },
          pollutionCertificate: {
            url: 'https://example.com/pollution.pdf',
            verified: true,
            validUntil: new Date(2024, 5, 30)
          }
        },
        currentLocation: {
          type: 'Point',
          coordinates: [77.2090 + (Math.random() * 0.1 - 0.05), 28.6139 + (Math.random() * 0.1 - 0.05)]
        },
        status: 'active',
        isAvailable: true,
        assignedRideService: service._id,
        averageRating: 4 + Math.random(),
        totalTrips: Math.floor(Math.random() * 100) + 50,
        maintenanceRecords: [
          {
            date: new Date(2023, 3, 15),
            description: 'Regular maintenance and oil change',
            odometer: 15000,
            cost: 3500,
            nextMaintenanceDue: new Date(2023, 9, 15)
          }
        ]
      };
      
      sampleVehicles.push(vehicle);
    }

    // Insert the sample vehicles
    await Vehicle.insertMany(sampleVehicles);
    console.log(`${sampleVehicles.length} sample vehicles have been added to the database`);
  } catch (error) {
    console.error('Error seeding vehicles:', error);
  }
};

// Call the seed functions
seedRideServices();
seedVehicles();

/**
 * @desc    Get all ride services
 * @route   GET /api/rides/services
 * @access  Public
 */
exports.getAllRideServices = async (req, res) => {
  try {
    // Get stationId from query param if provided
    const { stationId } = req.query;
    
    let query = {};
    
    // If stationId is provided, filter by services available at that station
    if (stationId) {
      query = { operationalAreas: { $in: [stationId] } };
    }
    
    const rideServices = await RideService.find(query)
      .populate('operationalAreas', 'name location')
      .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      count: rideServices.length,
      data: rideServices
    });
  } catch (err) {
    console.error('Error fetching ride services:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching ride services'
    });
  }
};

/**
 * @desc    Get ride services by type
 * @route   GET /api/rides/services/type/:type
 * @access  Public
 */
exports.getRideServicesByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['cab', 'shuttle', 'e-rickshaw', 'auto'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ride service type'
      });
    }
    
    const rideServices = await RideService.find({ 
      type, 
      active: true 
    });
    
    res.status(200).json({
      success: true,
      count: rideServices.length,
      data: rideServices
    });
  } catch (err) {
    console.error('Error fetching ride services by type:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get ride services available at a metro station
 * @route   GET /api/rides/services/station/:stationId
 * @access  Public
 */
exports.getRideServicesByStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    
    // Validate station ID format
    if (!mongoose.Types.ObjectId.isValid(stationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid station ID format'
      });
    }
    
    // Check if station exists
    const station = await MetroStation.findById(stationId);
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Metro station not found'
      });
    }
    
    // Find services available at this station
    const rideServices = await RideService.find({
      'operationAreas.metroStation': stationId,
      isAvailable: true,
      active: true
    });
    
    res.status(200).json({
      success: true,
      count: rideServices.length,
      data: rideServices
    });
  } catch (err) {
    console.error('Error fetching ride services by station:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get ride service by ID
 * @route   GET /api/rides/services/:id
 * @access  Public
 */
exports.getRideService = async (req, res) => {
  try {
    console.log('Fetching ride service with ID:', req.params.id);
    
    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ride service ID format'
      });
    }
    
    const rideService = await RideService.findById(req.params.id)
      .populate('metroStations');
    
    if (!rideService) {
      console.log('Ride service not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Ride service not found'
      });
    }
    
    console.log('Found ride service:', rideService.name);
    
    res.status(200).json({
      success: true,
      data: rideService
    });
  } catch (err) {
    console.error('Error in getRideService:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Create new ride service
 * @route   POST /api/rides/services
 * @access  Private/Admin
 */
exports.createRideService = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      baseRate,
      perKmRate,
      perMinuteRate,
      minFare,
      maxPassengers,
      isShared,
      operationalAreas,
      features,
      imageUrl
    } = req.body;
    
    // Check for required fields
    if (!name || !type || !baseRate || !maxPassengers) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, type, baseRate, and maxPassengers'
      });
    }
    
    // Validate operationalAreas - ensure they exist in the database
    if (operationalAreas && operationalAreas.length > 0) {
      const stationCount = await MetroStation.countDocuments({
        _id: { $in: operationalAreas }
      });
      
      if (stationCount !== operationalAreas.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more operational areas are invalid'
        });
      }
    }
    
    // Create new ride service
    const rideService = new RideService({
      name,
      type,
      description,
      baseRate,
      perKmRate: perKmRate || 0,
      perMinuteRate: perMinuteRate || 0,
      minFare: minFare || baseRate,
      maxPassengers,
      isShared: isShared || false,
      operationalAreas: operationalAreas || [],
      features: features || [],
      imageUrl: imageUrl || `https://source.unsplash.com/random/300x200/?${type}`
    });
    
    await rideService.save();
    
    return res.status(201).json({
      success: true,
      message: 'Ride service created successfully',
      data: rideService
    });
  } catch (err) {
    console.error('Error creating ride service:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating ride service'
    });
  }
};

/**
 * @desc    Update ride service
 * @route   PUT /api/rides/services/:id
 * @access  Private/Admin
 */
exports.updateRideService = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      baseRate,
      perKmRate,
      perMinuteRate,
      minFare,
      maxPassengers,
      isShared,
      operationalAreas,
      features,
      imageUrl,
      isActive
    } = req.body;
    
    // Build update object with only provided fields
    const updateFields = {};
    
    if (name !== undefined) updateFields.name = name;
    if (type !== undefined) updateFields.type = type;
    if (description !== undefined) updateFields.description = description;
    if (baseRate !== undefined) updateFields.baseRate = baseRate;
    if (perKmRate !== undefined) updateFields.perKmRate = perKmRate;
    if (perMinuteRate !== undefined) updateFields.perMinuteRate = perMinuteRate;
    if (minFare !== undefined) updateFields.minFare = minFare;
    if (maxPassengers !== undefined) updateFields.maxPassengers = maxPassengers;
    if (isShared !== undefined) updateFields.isShared = isShared;
    if (features !== undefined) updateFields.features = features;
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
    if (isActive !== undefined) updateFields.isActive = isActive;
    
    // Validate operationalAreas if provided
    if (operationalAreas && operationalAreas.length > 0) {
      const stationCount = await MetroStation.countDocuments({
        _id: { $in: operationalAreas }
      });
      
      if (stationCount !== operationalAreas.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more operational areas are invalid'
        });
      }
      
      updateFields.operationalAreas = operationalAreas;
    }
    
    // Find and update the ride service
    const rideService = await RideService.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    if (!rideService) {
      return res.status(404).json({
        success: false,
        message: 'Ride service not found'
      });
    }
    
    return res.json({
      success: true,
      message: 'Ride service updated successfully',
      data: rideService
    });
  } catch (err) {
    console.error('Error updating ride service:', err.message);
    
    // Check if error is due to invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Ride service not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while updating ride service'
    });
  }
};

/**
 * @desc    Delete ride service
 * @route   DELETE /api/rides/services/:id
 * @access  Private/Admin
 */
exports.deleteRideService = async (req, res) => {
  try {
    const rideService = await RideService.findById(req.params.id);
    
    if (!rideService) {
      return res.status(404).json({
        success: false,
        message: 'Ride service not found'
      });
    }
    
    // Check if there are any active bookings
    const activeBookings = await RideBooking.countDocuments({
      rideService: req.params.id,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service with active bookings. Please deactivate it instead.'
      });
    }
    
    await rideService.deleteOne();
    
    return res.json({
      success: true,
      message: 'Ride service deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting ride service:', err.message);
    
    // Check if error is due to invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Ride service not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting ride service'
    });
  }
};

/**
 * @desc    Get all ride bookings (admin only)
 * @route   GET /api/rides/bookings
 * @access  Private/Admin
 */
exports.getAllRideBookings = async (req, res) => {
  try {
    const { status, rideService, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (rideService) {
      query.rideService = rideService;
    }
    
    if (startDate || endDate) {
      query.pickupTime = {};
      if (startDate) {
        query.pickupTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.pickupTime.$lte = new Date(endDate);
      }
    }
    
    const bookings = await RideBooking.find(query)
      .populate('user', 'name email phone')
      .populate('vehicle', 'make model registrationNumber')
      .populate('rideService', 'name type')
      .populate('driver', 'name phone')
      .sort({ pickupTime: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get all user's ride bookings
 * @route   GET /api/rides/bookings/my-bookings
 * @access  Private
 */
exports.getMyRideBookings = async (req, res) => {
  try {
    const bookings = await RideBooking.find({ user: req.user.id })
      .populate('rideService', 'name type baseFare')
      .populate('vehicle', 'make model registrationNumber')
      .sort({ pickupTime: -1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error('Error fetching user ride bookings:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get a specific ride booking
 * @route   GET /api/rides/bookings/:id
 * @access  Private
 */
exports.getRideBooking = async (req, res) => {
  try {
    const booking = await RideBooking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('vehicle', 'make model registrationNumber')
      .populate('rideService', 'name type baseFare perKilometerRate perMinuteRate')
      .populate('driver', 'name phone');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to view this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error('Error fetching ride booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Create a ride booking
 * @route   POST /api/rides/bookings
 * @access  Private
 */
exports.createRideBooking = async (req, res) => {
  try {
    const {
      rideService,
      pickupLocation,
      dropoffLocation,
      pickupTime,
      distance,
      estimatedDuration,
      numberOfPassengers,
      specialRequirements,
      paymentMethod
    } = req.body;
    
    // Validate ride service
    if (!rideService) {
      return res.status(400).json({
        success: false,
        message: 'Ride service ID is required'
      });
    }
    
    // Get ride service details
    const serviceDetails = await RideService.findById(rideService);
    
    if (!serviceDetails) {
      return res.status(404).json({
        success: false,
        message: 'Ride service not found'
      });
    }
    
    if (!serviceDetails.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This ride service is currently unavailable'
      });
    }
    
    // Validate required fields
    if (!pickupLocation || !dropoffLocation || !pickupTime || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required booking details'
      });
    }
    
    // Validate passenger count
    if (!numberOfPassengers || numberOfPassengers < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please specify at least 1 passenger'
      });
    }
    
    if (numberOfPassengers > serviceDetails.maxPassengers) {
      return res.status(400).json({
        success: false,
        message: `This service can only accommodate up to ${serviceDetails.maxPassengers} passengers`
      });
    }
    
    // Get appropriate vehicle type based on ride service type
    let vehicleTypes = [];
    if (serviceDetails.type === 'cab') {
      vehicleTypes = ['sedan', 'hatchback', 'suv'];
    } else if (serviceDetails.type === 'shuttle') {
      vehicleTypes = ['suv'];
    } else if (serviceDetails.type === 'e-rickshaw') {
      vehicleTypes = ['auto'];
    }
    
    // Find an available vehicle for this ride service
    let vehicle = await Vehicle.findOne({
      assignedRideService: serviceDetails._id,
      vehicleType: { $in: vehicleTypes },
      status: 'active',
      isAvailable: true
    });
    
    if (!vehicle) {
      // If no exact match, try to find any available vehicle of the right type
      const anyVehicle = await Vehicle.findOne({
        vehicleType: { $in: vehicleTypes },
        status: 'active',
        isAvailable: true
      });
      
      if (!anyVehicle) {
        // If no vehicle is available, create a booking without a vehicle
        // This is a fallback for development/testing purposes
        console.log('No vehicles available, proceeding with booking without vehicle assignment');
      } else {
        // Use the vehicle and update its assigned service
        anyVehicle.assignedRideService = serviceDetails._id;
        await anyVehicle.save();
        vehicle = anyVehicle;
      }
    }
    
    // Calculate fare
    const baseFare = serviceDetails.baseFare || serviceDetails.basePrice || 100;
    const perKmRate = serviceDetails.perKilometerRate || serviceDetails.pricePerKm || 10;
    const perMinuteRate = serviceDetails.perMinuteRate || 1;
    
    const distanceFare = perKmRate * distance;
    const timeFare = perMinuteRate * estimatedDuration;
    
    // Calculate tax (18%)
    const subtotal = baseFare + distanceFare + timeFare;
    const tax = subtotal * 0.18;
    
    // Calculate estimated dropoff time
    const pickupDateTime = new Date(pickupTime);
    const estimatedDropoffTime = new Date(pickupDateTime);
    estimatedDropoffTime.setMinutes(estimatedDropoffTime.getMinutes() + estimatedDuration);
    
    const minFare = serviceDetails.minimumFare || serviceDetails.minFare || 50;
    const totalFare = Math.max(minFare, subtotal + tax);
    
    // Create new booking
    const newBooking = new RideBooking({
      user: req.user.id,
      vehicle: vehicle ? vehicle._id : null, // Allow null vehicle for development
      rideService,
      pickupLocation: {
        address: pickupLocation.address,
        coordinates: {
          type: 'Point',
          coordinates: pickupLocation.coordinates
        }
      },
      dropoffLocation: {
        address: dropoffLocation.address,
        coordinates: {
          type: 'Point',
          coordinates: dropoffLocation.coordinates
        }
      },
      pickupTime: pickupDateTime,
      estimatedDropoffTime,
      distance,
      estimatedDuration,
      numberOfPassengers,
      specialRequirements: specialRequirements || [],
      status: 'pending',
      fare: {
        baseFare,
        distanceFare,
        timeFare,
        waitingFare: 0,
        surgeFare: 0,
        promoDiscount: 0,
        tax,
        total: totalFare,
        currency: 'INR'
      },
      paymentMethod,
      paymentStatus: 'pending'
    });
    
    // Generate QR code
    try {
      const qrCodeData = JSON.stringify({
        bookingId: newBooking._id,
        userId: req.user.id,
        serviceId: rideService,
        timestamp: Date.now()
      });
      
      const qrCodeUrl = await QRCode.toDataURL(qrCodeData);
      newBooking.qrCode = qrCodeUrl;
    } catch (qrError) {
      console.error('Error generating QR code:', qrError);
      // Continue without QR code if there's an error
    }
    
    await newBooking.save();
    
    // Populate the booking with user and service details
    const populatedBooking = await RideBooking.findById(newBooking._id)
      .populate('user', 'name email phone')
      .populate('vehicle')
      .populate('rideService');
    
    return res.status(201).json({
      success: true,
      message: 'Ride booking created successfully',
      data: populatedBooking
    });
  } catch (err) {
    console.error('Error creating ride booking:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating ride booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Cancel ride booking
 * @route   PUT /api/rides/bookings/:id/cancel
 * @access  Private
 */
exports.cancelRideBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    
    console.log(`Attempting to cancel ride booking: ${req.params.id}`);
    
    // Check for valid MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID format'
      });
    }
    
    const booking = await RideBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Ride booking not found'
      });
    }
    
    // Check if user is authorized to cancel this booking
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking with status: ${booking.status}`
      });
    }
    
    if (booking.status === 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a ride that is already in progress'
      });
    }
    
    // Calculate refund amount based on cancellation time
    const now = new Date();
    const rideTime = new Date(booking.pickupTime);
    const minutesBeforeRide = Math.floor((rideTime - now) / (1000 * 60));
    
    let refundAmount = 0;
    let refundPercentage = 0;
    
    // Refund policy: 100% if >60 min, 75% if 30-60 min, 50% if 10-30 min, 0% if <10 min before scheduled time
    if (minutesBeforeRide > 60) {
      refundPercentage = 1.0;
    } else if (minutesBeforeRide > 30) {
      refundPercentage = 0.75;
    } else if (minutesBeforeRide > 10) {
      refundPercentage = 0.5;
    }
    
    refundAmount = booking.fare.total * refundPercentage;
    
    // Use the model's cancel method to properly update the booking
    booking.cancel('user', cancellationReason);
    
    // Add refund information
    booking.refundAmount = refundAmount;
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: `Booking cancelled successfully. Refund amount: ₹${refundAmount.toFixed(2)}`,
      data: booking
    });
  } catch (err) {
    console.error('Error cancelling ride booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Submit feedback for a ride
 * @route   PUT /api/rides/bookings/:id/feedback
 * @access  Private
 */
exports.submitRideFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5'
      });
    }
    
    const booking = await RideBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to submit feedback for this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this booking'
      });
    }
    
    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for completed rides'
      });
    }
    
    // Check if feedback already submitted
    if (booking.rating && booking.rating.value) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted for this booking'
      });
    }
    
    // Use the model's method to add rating
    booking.addRating(rating, comment);
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: booking
    });
  } catch (err) {
    console.error('Error submitting ride feedback:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * @desc    Get all ride bookings assigned to a driver
 * @route   GET /api/rides/driver/bookings
 * @access  Private (drivers only)
 */
exports.getDriverRideBookings = async (req, res) => {
  try {
    // Check if the user is a driver
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not authorized as a driver.'
      });
    }
    
    // Get query params for filtering
    const { status } = req.query;
    
    let query = { driver: req.user.id };
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const bookings = await RideBooking.find(query)
      .populate('user', 'name phone')
      .populate('rideService')
      .sort({ scheduledFor: 1 });
    
    return res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error('Error fetching driver ride bookings:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching driver bookings'
    });
  }
};

/**
 * @desc    Update ride booking status by driver
 * @route   PUT /api/rides/driver/bookings/:id/status
 * @access  Private (drivers only)
 */
exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['confirmed', 'in-progress', 'completed', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: confirmed, in-progress, completed, no-show'
      });
    }
    
    const booking = await RideBooking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if the user is assigned as the driver for this booking
    if (booking.driver && booking.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update status of a cancelled booking'
      });
    }
    
    // Update booking status
    booking.status = status;
    
    // Update status-specific fields
    if (status === 'in-progress') {
      booking.ride = {
        ...booking.ride,
        startTime: new Date()
      };
    } else if (status === 'completed') {
      booking.ride = {
        ...booking.ride,
        endTime: new Date()
      };
      
      // Calculate actual duration in minutes
      if (booking.ride.startTime) {
        const durationMs = new Date() - new Date(booking.ride.startTime);
        booking.ride.actualDuration = Math.round(durationMs / (1000 * 60));
      }
      
      // For cash payments, mark as paid when ride is completed
      if (booking.paymentMethod === 'cash' && booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid';
        booking.paymentDetails = {
          method: 'cash',
          transactionId: uuidv4(),
          amount: booking.fare.totalFare,
          paidAt: new Date()
        };
      }
    } else if (status === 'no-show') {
      // Apply no-show fee (50% of the fare)
      const noShowFee = booking.fare.totalFare * 0.5;
      
      booking.cancellation = {
        cancelledAt: new Date(),
        reason: 'Customer no-show',
        cancellationFee: noShowFee
      };
      
      // For prepaid bookings, process refund of remaining amount
      if (booking.paymentStatus === 'paid') {
        booking.refund = {
          amount: booking.fare.totalFare - noShowFee,
          status: 'pending',
          processedAt: null
        };
      }
    }
    
    await booking.save();
    
    return res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: booking
    });
  } catch (err) {
    console.error('Error updating ride status:', err.message);
    
    // Check if error is due to invalid ObjectId
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error while updating ride status'
    });
  }
};

/**
 * @desc    Get all metro stations
 * @route   GET /api/rides/metro-stations
 * @access  Public
 */
exports.getAllMetroStations = async (req, res) => {
  try {
    const stations = await MetroStation.find()
      .sort({ name: 1 });
    
    return res.json({
      success: true,
      count: stations.length,
      data: stations
    });
  } catch (err) {
    console.error('Error fetching metro stations:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching metro stations'
    });
  }
};
