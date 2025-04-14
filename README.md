# Park and Ride: Smart Parking and Last Mile Connectivity Solution

## Project Overview
This is a full-stack MERN (MongoDB, Express, React, Node.js) application for seamless parking reservations and last-mile transportation options. The application allows commuters to pre-book parking spaces near metro stations, then seamlessly transition to public transport, and finally reserve last-mile rides to their final destinations - all in one integrated platform.

## Project Structure
- `client/`: React frontend application
- `server/`: Express and Node.js backend API
- Backend includes models, controllers, and routes for users, parking spots, metro stations, and ride services

## Features

### Seamless Parking Booking
- Advance booking system for parking spaces near metro stations
- Smart parking spot assignment based on real-time availability
- Flexible cancellation and modifications
- License plate recognition and RFID entry support

### Cab/Last-Mile Shuttle Integration
- Multi-modal booking for cabs, shuttles, and e-rickshaws
- On-demand and scheduled rides
- Pooling and ride-sharing options
- Integration with public transport

### Availability Conflict Resolution
- Live slot tracking with real-time availability updates
- Auto-cancellation for no-shows
- Dynamic slot reassignment

### Dynamic Pricing
- Demand-based pricing adjustments
- Subscription plans and loyalty rewards
- AI-based surge pricing during peak hours

### Offline Mode Handling
- Offline booking access
- Stored navigation routes
- Auto-sync on reconnection

## Technology Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- RESTful API design

### Frontend (Planned)
- React with Hooks and Context API
- Redux for state management
- React Router for navigation
- Material-UI for component design

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the server directory:
   ```
   cd parkandride/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/parkandride
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRY=7d
   NODE_ENV=development
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup (Coming Soon)
1. Navigate to the client directory:
   ```
   cd parkandride/client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the client development server:
   ```
   npm start
   ```

## API Documentation

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user profile
- PUT `/api/auth/update-profile` - Update user profile
- PUT `/api/auth/change-password` - Change password

### Parking
- GET `/api/parking/spots` - Get all parking spots
- GET `/api/parking/spots/nearby` - Get nearby parking spots
- GET `/api/parking/spots/:id` - Get specific parking spot
- GET `/api/parking/spots/:id/availability` - Check parking spot availability
- GET `/api/parking/stations` - Get all metro stations
- GET `/api/parking/stations/nearby` - Get nearby metro stations
- GET `/api/parking/stations/:id` - Get specific metro station

### Bookings
- GET `/api/bookings/my-bookings` - Get current user's bookings
- POST `/api/bookings` - Create a new booking
- GET `/api/bookings/:id` - Get specific booking
- PUT `/api/bookings/:id/cancel` - Cancel a booking
- PUT `/api/bookings/:id/check-in` - Check in for a booking
- PUT `/api/bookings/:id/check-out` - Check out from a booking

### Rides
- GET `/api/rides/services` - Get all ride services
- GET `/api/rides/services/:id` - Get specific ride service
- GET `/api/rides/bookings/my-bookings` - Get current user's ride bookings
- POST `/api/rides/bookings` - Create a new ride booking
- GET `/api/rides/bookings/:id` - Get specific ride booking
- PUT `/api/rides/bookings/:id/cancel` - Cancel a ride booking
- PUT `/api/rides/bookings/:id/rate` - Rate a completed ride

## License
This project is licensed under the MIT License.
