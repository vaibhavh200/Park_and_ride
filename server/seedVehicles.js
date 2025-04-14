const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');
const RideService = require('./models/RideService');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parkandride');
    console.log('MongoDB Connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Sample vehicles data
const sampleVehicles = [
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    color: 'Silver',
    licensePlate: 'DL01AB1234',
    vehicleType: 'sedan',
    capacity: 4,
    features: ['ac', 'wifi', 'music'],
    fuelType: 'petrol',
    transmissionType: 'automatic',
    registrationDate: new Date('2022-01-15'),
    insuranceDetails: {
      policyNumber: 'INS001',
      provider: 'ICICI Lombard',
      validUntil: new Date('2024-01-15')
    },
    inspectionStatus: {
      lastInspectionDate: new Date('2023-01-15'),
      nextInspectionDue: new Date('2024-01-15'),
      status: 'passed'
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.2090, 28.6139]
    },
    status: 'active',
    isAvailable: true
  },
  {
    make: 'Honda',
    model: 'City',
    year: 2022,
    color: 'White',
    licensePlate: 'DL02CD5678',
    vehicleType: 'sedan',
    capacity: 4,
    features: ['ac', 'music', 'childSeat'],
    fuelType: 'diesel',
    transmissionType: 'manual',
    registrationDate: new Date('2022-02-20'),
    insuranceDetails: {
      policyNumber: 'INS002',
      provider: 'HDFC ERGO',
      validUntil: new Date('2024-02-20')
    },
    inspectionStatus: {
      lastInspectionDate: new Date('2023-02-20'),
      nextInspectionDue: new Date('2024-02-20'),
      status: 'passed'
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.2190, 28.6239]
    },
    status: 'active',
    isAvailable: true
  },
  {
    make: 'Mahindra',
    model: 'XUV500',
    year: 2022,
    color: 'Black',
    licensePlate: 'DL03EF9012',
    vehicleType: 'suv',
    capacity: 7,
    features: ['ac', 'wifi', 'music', 'childSeat'],
    fuelType: 'diesel',
    transmissionType: 'automatic',
    registrationDate: new Date('2022-03-10'),
    insuranceDetails: {
      policyNumber: 'INS003',
      provider: 'Bajaj Allianz',
      validUntil: new Date('2024-03-10')
    },
    inspectionStatus: {
      lastInspectionDate: new Date('2023-03-10'),
      nextInspectionDue: new Date('2024-03-10'),
      status: 'passed'
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.2290, 28.6339]
    },
    status: 'active',
    isAvailable: true
  },
  {
    make: 'Maruti',
    model: 'Swift',
    year: 2022,
    color: 'Blue',
    licensePlate: 'DL04GH3456',
    vehicleType: 'hatchback',
    capacity: 4,
    features: ['ac', 'music'],
    fuelType: 'petrol',
    transmissionType: 'manual',
    registrationDate: new Date('2022-04-05'),
    insuranceDetails: {
      policyNumber: 'INS004',
      provider: 'ICICI Lombard',
      validUntil: new Date('2024-04-05')
    },
    inspectionStatus: {
      lastInspectionDate: new Date('2023-04-05'),
      nextInspectionDue: new Date('2024-04-05'),
      status: 'passed'
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.2390, 28.6439]
    },
    status: 'active',
    isAvailable: true
  },
  {
    make: 'Bajaj',
    model: 'RE',
    year: 2022,
    color: 'Yellow',
    licensePlate: 'DL05IJ7890',
    vehicleType: 'auto',
    capacity: 3,
    features: ['ac'],
    fuelType: 'cng',
    transmissionType: 'manual',
    registrationDate: new Date('2022-05-15'),
    insuranceDetails: {
      policyNumber: 'INS005',
      provider: 'HDFC ERGO',
      validUntil: new Date('2024-05-15')
    },
    inspectionStatus: {
      lastInspectionDate: new Date('2023-05-15'),
      nextInspectionDue: new Date('2024-05-15'),
      status: 'passed'
    },
    currentLocation: {
      type: 'Point',
      coordinates: [77.2490, 28.6539]
    },
    status: 'active',
    isAvailable: true
  }
];

// Seed vehicles
const seedVehicles = async () => {
  try {
    // Find an admin user to assign as driver
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Get ride services
    const rideServices = await RideService.find();
    if (rideServices.length === 0) {
      console.log('No ride services found. Please create ride services first.');
      return;
    }

    // Clear existing vehicles
    await Vehicle.deleteMany({});
    console.log('Existing vehicles cleared');

    // Add driver and assignedRideService to each vehicle
    const vehiclesWithDriver = sampleVehicles.map((vehicle, index) => ({
      ...vehicle,
      driver: adminUser._id,
      assignedRideService: rideServices[index % rideServices.length]._id
    }));

    // Insert vehicles
    const createdVehicles = await Vehicle.insertMany(vehiclesWithDriver);
    console.log(`${createdVehicles.length} vehicles seeded successfully`);

    // Log vehicle IDs for reference
    createdVehicles.forEach(vehicle => {
      console.log(`Vehicle ID: ${vehicle._id}, License Plate: ${vehicle.licensePlate}`);
    });

  } catch (error) {
    console.error('Error seeding vehicles:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await seedVehicles();
  mongoose.connection.close();
};

// Run the script
main(); 