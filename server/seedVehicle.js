const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');

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

// Add a test vehicle
const addTestVehicle = async () => {
  try {
    // Check if test vehicle already exists
    const existingVehicle = await Vehicle.findOne({ licensePlate: 'TEST123' });
    
    if (existingVehicle) {
      console.log('Test vehicle already exists in the database with ID:', existingVehicle._id);
      console.log('Use this ID for ride bookings testing:', existingVehicle._id.toString());
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
  await addTestVehicle();
  mongoose.connection.close();
};

// Run the seed function
seedDatabase(); 