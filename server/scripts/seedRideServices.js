const mongoose = require('mongoose');
const RideService = require('../models/RideService');
const MetroStation = require('../models/MetroStation');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parkandride', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected for seeding ride services'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Sample ride services data
const rideServices = [
  {
    name: 'QuickRide Compact',
    description: 'Affordable and comfortable compact cars for your daily commute',
    type: 'cab',
    serviceType: 'pool',
    vehicleTypes: ['hatchback', 'sedan'],
    baseFare: 100,
    perKilometerRate: 10,
    perMinuteRate: 1,
    minimumFare: 150,
    cancellationFee: 50,
    serviceFee: 20,
    waitingChargePerMinute: 2,
    surgeMultiplier: 1.2,
    maxWaitingTime: 5,
    commissionPercentage: 10,
    features: ['ac', 'wifi'],
    maxPassengers: 4,
    estimatedTimeCalculation: {
      baseTime: 5,
      timePerKilometer: 2,
      trafficMultiplier: 1.2
    },
    isActive: true,
    availabilityTimes: {
      monday: { isAvailable: true, startTime: '06:00', endTime: '23:00' },
      tuesday: { isAvailable: true, startTime: '06:00', endTime: '23:00' },
      wednesday: { isAvailable: true, startTime: '06:00', endTime: '23:00' },
      thursday: { isAvailable: true, startTime: '06:00', endTime: '23:00' },
      friday: { isAvailable: true, startTime: '06:00', endTime: '23:00' },
      saturday: { isAvailable: true, startTime: '06:00', endTime: '23:00' },
      sunday: { isAvailable: true, startTime: '06:00', endTime: '23:00' }
    },
    icon: 'local_taxi',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop',
    operationalAreas: ['Delhi', 'Gurgaon', 'Noida'],
    operatingHours: {
      start: '06:00',
      end: '23:00'
    },
    provider: {
      name: 'QuickRide',
      contactPhone: '1800-123-4567',
      email: 'support@quickride.com'
    },
    availableLocations: [
      {
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        isActive: true
      },
      {
        city: 'Gurgaon',
        state: 'Haryana',
        country: 'India',
        isActive: true
      },
      {
        city: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        isActive: true
      }
    ]
  },
  {
    name: 'CityRides Sedan',
    description: 'Premium sedan service for a luxurious travel experience',
    type: 'cab',
    serviceType: 'cab',
    vehicleTypes: ['sedan', 'luxury'],
    baseFare: 150,
    perKilometerRate: 12,
    perMinuteRate: 1.5,
    minimumFare: 200,
    cancellationFee: 75,
    serviceFee: 30,
    waitingChargePerMinute: 3,
    surgeMultiplier: 1.3,
    maxWaitingTime: 5,
    commissionPercentage: 12,
    features: ['ac', 'wifi', 'childSeat'],
    maxPassengers: 4,
    estimatedTimeCalculation: {
      baseTime: 5,
      timePerKilometer: 2,
      trafficMultiplier: 1.2
    },
    isActive: true,
    availabilityTimes: {
      monday: { isAvailable: true, startTime: '05:00', endTime: '23:30' },
      tuesday: { isAvailable: true, startTime: '05:00', endTime: '23:30' },
      wednesday: { isAvailable: true, startTime: '05:00', endTime: '23:30' },
      thursday: { isAvailable: true, startTime: '05:00', endTime: '23:30' },
      friday: { isAvailable: true, startTime: '05:00', endTime: '23:30' },
      saturday: { isAvailable: true, startTime: '05:00', endTime: '23:30' },
      sunday: { isAvailable: true, startTime: '05:00', endTime: '23:30' }
    },
    icon: 'local_taxi',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop',
    operationalAreas: ['Delhi', 'Gurgaon', 'Noida', 'Faridabad'],
    operatingHours: {
      start: '05:00',
      end: '23:30'
    },
    provider: {
      name: 'CityRides',
      contactPhone: '1800-987-6543',
      email: 'info@cityrides.com'
    },
    availableLocations: [
      {
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        isActive: true
      },
      {
        city: 'Gurgaon',
        state: 'Haryana',
        country: 'India',
        isActive: true
      },
      {
        city: 'Noida',
        state: 'Uttar Pradesh',
        country: 'India',
        isActive: true
      },
      {
        city: 'Faridabad',
        state: 'Haryana',
        country: 'India',
        isActive: true
      }
    ]
  },
  {
    name: 'MetroShuttle',
    description: 'Shared shuttle service connecting metro stations to nearby areas',
    type: 'shuttle',
    serviceType: 'shuttle',
    vehicleTypes: ['suv'],
    baseFare: 40,
    perKilometerRate: 5,
    perMinuteRate: 0.5,
    minimumFare: 50,
    cancellationFee: 20,
    serviceFee: 10,
    waitingChargePerMinute: 1,
    surgeMultiplier: 1.1,
    maxWaitingTime: 10,
    commissionPercentage: 8,
    features: ['ac'],
    maxPassengers: 12,
    estimatedTimeCalculation: {
      baseTime: 10,
      timePerKilometer: 2.5,
      trafficMultiplier: 1.3
    },
    isActive: true,
    availabilityTimes: {
      monday: { isAvailable: true, startTime: '07:00', endTime: '21:00' },
      tuesday: { isAvailable: true, startTime: '07:00', endTime: '21:00' },
      wednesday: { isAvailable: true, startTime: '07:00', endTime: '21:00' },
      thursday: { isAvailable: true, startTime: '07:00', endTime: '21:00' },
      friday: { isAvailable: true, startTime: '07:00', endTime: '21:00' },
      saturday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
      sunday: { isAvailable: true, startTime: '08:00', endTime: '20:00' }
    },
    icon: 'airport_shuttle',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop',
    operationalAreas: ['Delhi', 'Gurgaon', 'Noida'],
    operatingHours: {
      start: '07:00',
      end: '21:00'
    },
    provider: {
      name: 'MetroShuttle',
      contactPhone: '1800-456-7890',
      email: 'bookings@metroshuttle.com'
    }
  },
  {
    name: 'EcoRickshaw',
    description: 'Environment-friendly electric rickshaw service for short distances',
    type: 'e-rickshaw',
    serviceType: 'last-mile',
    vehicleTypes: ['auto'],
    baseFare: 30,
    perKilometerRate: 8,
    perMinuteRate: 0.5,
    minimumFare: 40,
    cancellationFee: 15,
    serviceFee: 5,
    waitingChargePerMinute: 1,
    surgeMultiplier: 1.1,
    maxWaitingTime: 5,
    commissionPercentage: 5,
    features: [],
    maxPassengers: 3,
    estimatedTimeCalculation: {
      baseTime: 5,
      timePerKilometer: 3,
      trafficMultiplier: 1.1
    },
    isActive: true,
    availabilityTimes: {
      monday: { isAvailable: true, startTime: '06:00', endTime: '22:00' },
      tuesday: { isAvailable: true, startTime: '06:00', endTime: '22:00' },
      wednesday: { isAvailable: true, startTime: '06:00', endTime: '22:00' },
      thursday: { isAvailable: true, startTime: '06:00', endTime: '22:00' },
      friday: { isAvailable: true, startTime: '06:00', endTime: '22:00' },
      saturday: { isAvailable: true, startTime: '07:00', endTime: '21:00' },
      sunday: { isAvailable: true, startTime: '07:00', endTime: '21:00' }
    },
    icon: 'electric_rickshaw',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&auto=format&fit=crop',
    operationalAreas: ['Delhi', 'Gurgaon', 'Noida'],
    operatingHours: {
      start: '06:00',
      end: '22:00'
    },
    provider: {
      name: 'EcoRickshaw',
      contactPhone: '1800-789-0123',
      email: 'support@ecorickshaw.com'
    }
  }
];

// Function to seed ride services
const seedRideServices = async () => {
  try {
    // Clear existing ride services
    await RideService.deleteMany({});
    console.log('Cleared existing ride services');

    // Insert new ride services
    const insertedServices = await RideService.insertMany(rideServices);
    console.log(`Successfully seeded ${insertedServices.length} ride services`);

    // Find a metro station to link with ride services
    const metroStation = await MetroStation.findOne();
    if (metroStation) {
      // Update ride services with metro station reference
      await RideService.updateMany(
        { type: { $in: ['shuttle', 'e-rickshaw'] } },
        { $set: { metroStation: metroStation._id } }
      );
      console.log('Linked ride services with metro station');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding ride services:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedRideServices(); 