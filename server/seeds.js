const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ParkingSpot = require('./models/ParkingSpot');
const MetroStation = require('./models/MetroStation');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const Vehicle = require('./models/Vehicle');

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

// Sample metro stations
const metroStations = [
  {
    name: 'Central Metro Station',
    code: 'CMS',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139], // Delhi coordinates
      address: {
        street: 'Central Metro Road',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      }
    },
    lines: ['Red', 'Blue'],
    hasParking: true,
    interchange: true,
    facilities: ['elevator', 'escalator', 'toilet', 'atm']
  },
  {
    name: 'East Metro Station',
    code: 'EMS',
    location: {
      type: 'Point',
      coordinates: [77.2810, 28.6129],
      address: {
        street: 'East Metro Road',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110002',
        country: 'India'
      }
    },
    lines: ['Blue'],
    hasParking: true,
    interchange: false,
    facilities: ['elevator', 'escalator', 'toilet']
  }
];

// Sample parking spots
const parkingSpots = [
  {
    name: 'Central Metro Parking',
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139],
      address: {
        street: 'Central Metro Road',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      }
    },
    totalSpots: 50,
    availableSpots: 20,
    type: 'covered',
    hourlyRate: 25,
    dailyRate: 200,
    monthlyRate: 4500,
    amenities: ['electric-charging', 'cctv', 'security-guard', 'disabled-access'],
    operatingHours: {
      openTime: '06:00',
      closeTime: '00:00',
      is24Hours: false
    },
    images: ['https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=500&auto=format&fit=crop'],
    ratings: {
      average: 4.5,
      count: 28
    },
    active: true
  },
  {
    name: 'East Metro Parking',
    location: {
      type: 'Point',
      coordinates: [77.2810, 28.6129],
      address: {
        street: 'East Metro Road',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110002',
        country: 'India'
      }
    },
    totalSpots: 30,
    availableSpots: 12,
    type: 'open',
    hourlyRate: 20,
    dailyRate: 150,
    monthlyRate: 3500,
    amenities: ['cctv', 'car-wash'],
    operatingHours: {
      openTime: '05:30',
      closeTime: '23:30',
      is24Hours: false
    },
    images: ['https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=500&auto=format&fit=crop'],
    ratings: {
      average: 4.0,
      count: 18
    },
    active: true
  }
];

// Sample users
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210'
  },
  {
    name: 'Test User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    phone: '9876543211'
  }
];

// Seed data function
const seedData = async () => {
  try {
    // Clear existing data
    await MetroStation.deleteMany();
    await ParkingSpot.deleteMany();
    await User.deleteMany();
    
    console.log('Data cleared');
    
    // Insert metro stations
    const createdStations = await MetroStation.insertMany(metroStations);
    console.log(`${createdStations.length} metro stations created`);
    
    // Insert parking spots with references to metro stations
    const parkingSpotsWithRefs = parkingSpots.map((spot, index) => ({
      ...spot,
      metroStation: createdStations[index]._id
    }));
    
    const createdParkingSpots = await ParkingSpot.insertMany(parkingSpotsWithRefs);
    console.log(`${createdParkingSpots.length} parking spots created`);
    
    // Hash passwords and create users
    const hashedUsers = await Promise.all(users.map(async (user) => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      return {
        ...user,
        password: hashedPassword
      };
    }));
    
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`${createdUsers.length} users created`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Add a test vehicle
const addTestVehicle = async () => {
  try {
    // Check if test vehicle already exists
    const existingVehicle = await Vehicle.findOne({ licensePlate: 'TEST123' });
    
    if (existingVehicle) {
      console.log('Test vehicle already exists in the database');
      return;
    }
    
    // Find an admin user to use as the driver
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('No admin user found to assign as driver');
      return;
    }
    
    // Create the test vehicle
    const testVehicle = new Vehicle({
      driver: adminUser._id,
      make: 'Test Make',
      model: 'Test Model',
      year: 2023,
      color: 'White',
      licensePlate: 'TEST123',
      vehicleType: 'sedan',
      capacity: 4,
      features: ['ac', 'wifi'],
      fuelType: 'electric',
      transmissionType: 'automatic',
      registrationDate: new Date('2023-01-01'),
      insuranceDetails: {
        policyNumber: 'POLICY123',
        provider: 'Test Insurance',
        validUntil: new Date('2024-12-31')
      },
      inspectionStatus: {
        lastInspectionDate: new Date('2023-01-15'),
        nextInspectionDue: new Date('2023-07-15'),
        status: 'passed'
      },
      documents: {
        registrationCertificate: {
          url: 'https://example.com/reg.pdf',
          verified: true
        },
        insurance: {
          url: 'https://example.com/insurance.pdf',
          verified: true
        },
        pollutionCertificate: {
          url: 'https://example.com/pollution.pdf',
          verified: true,
          validUntil: new Date('2024-01-15')
        }
      },
      currentLocation: {
        type: 'Point',
        coordinates: [77.2090, 28.6139] // Example coordinates
      },
      status: 'active',
      isAvailable: true
    });
    
    await testVehicle.save();
    console.log('Test vehicle added to the database with ID:', testVehicle._id);
    console.log('Use this ID for ride bookings testing:', testVehicle._id.toString());
  } catch (error) {
    console.error('Error adding test vehicle:', error);
  }
};

// Main function
const seedDatabase = async () => {
  await connectDB();
  await seedData();
  await addTestVehicle();
  mongoose.connection.close();
};

// Run the seed function
seedDatabase(); 