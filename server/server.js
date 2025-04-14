const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const RideService = require('./models/RideService');
const MetroStation = require('./models/MetroStation');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/parking', require('./routes/parking.routes'));
app.use('/api/rides', require('./routes/rides.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/multimodal', require('./routes/multimodal.routes'));

// Default route
app.get('/', (req, res) => {
  res.send('Park and Ride API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize sample ride services data if not exists
const initializeData = async () => {
  try {
    const servicesCount = await RideService.countDocuments();
    
    if (servicesCount === 0) {
      // Get a list of metro stations to link services to
      const stations = await MetroStation.find().limit(5);
      
      if (stations.length === 0) {
        console.log('No metro stations found. Skipping sample ride services creation.');
        return;
      }
      
      // Sample ride services data
      const sampleServices = [
        {
          name: 'Eco Cab',
          type: 'cab',
          description: 'Eco-friendly cab service for efficient last-mile connectivity',
          baseRate: 50,
          perKmRate: 15,
          perMinuteRate: 2,
          minFare: 80,
          maxPassengers: 4,
          isShared: false,
          operationAreas: stations.map(station => ({
            metroStation: station._id,
            radius: 10
          })),
          estimatedWaitTime: 5,
          vehicleTypes: ['Sedan', 'Hatchback'],
          features: ['ac', 'wifi']
        },
        {
          name: 'Metro Shuttle',
          type: 'shuttle',
          description: 'Scheduled shuttle service from metro stations to popular destinations',
          baseRate: 30,
          perKmRate: 5,
          perMinuteRate: 0,
          minFare: 30,
          maxPassengers: 15,
          isShared: true,
          operationAreas: stations.map(station => ({
            metroStation: station._id,
            radius: 15
          })),
          estimatedWaitTime: 10,
          vehicleTypes: ['Mini Bus'],
          features: ['ac', 'wifi', 'luggage-space']
        },
        {
          name: 'Green Rickshaw',
          type: 'e-rickshaw',
          description: 'Electric rickshaws for short distances around metro stations',
          baseRate: 20,
          perKmRate: 10,
          perMinuteRate: 0,
          minFare: 30,
          maxPassengers: 3,
          isShared: false,
          operationAreas: stations.map(station => ({
            metroStation: station._id,
            radius: 5
          })),
          estimatedWaitTime: 3,
          vehicleTypes: ['E-Rickshaw'],
          features: []
        },
        {
          name: 'ShareRide',
          type: 'cab',
          description: 'Shared cab service for cost-effective travel',
          baseRate: 40,
          perKmRate: 12,
          perMinuteRate: 1,
          minFare: 60,
          maxPassengers: 4,
          isShared: true,
          operationAreas: stations.map(station => ({
            metroStation: station._id,
            radius: 8
          })),
          estimatedWaitTime: 8,
          vehicleTypes: ['Sedan'],
          features: ['ac']
        },
        {
          name: 'Auto Connect',
          type: 'auto',
          description: 'Traditional auto rickshaw service with digital booking',
          baseRate: 25,
          perKmRate: 8,
          perMinuteRate: 0,
          minFare: 35,
          maxPassengers: 3,
          isShared: false,
          operationAreas: stations.map(station => ({
            metroStation: station._id,
            radius: 6
          })),
          estimatedWaitTime: 4,
          vehicleTypes: ['Auto Rickshaw'],
          features: []
        }
      ];
      
      await RideService.insertMany(sampleServices);
      console.log('Sample ride services have been added to the database');
    } else {
      console.log('Ride services already exist in the database');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('MongoDB Connected:', process.env.MONGO_URI || 'localhost');
  
  // Initialize sample data
  initializeData();
});
