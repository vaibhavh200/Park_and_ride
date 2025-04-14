# Park and Ride System

A comprehensive urban mobility solution that integrates parking reservations and last-mile transportation options.

## Overview

The Park and Ride system enhances urban mobility by integrating parking reservations and last-mile transportation options. This system allows commuters to pre-book parking spaces, seamlessly transition to public transport, and reserve last-mile rides, ensuring a smooth, efficient, and hassle-free travel experience.

## Features

### Seamless Parking Booking

- Advance Booking System: Book parking spaces near metro stations
- Smart Parking Spot Assignment: Dynamically allocates spots based on real-time availability
- Flexible Cancellation & Modifications: Cancel or modify reservations before arrival
- Contactless entry/exit using QR codes

### Cab/Last-Mile Shuttle Integration

- Multi-Modal Booking: Book cabs, shuttles, or e-rickshaws via the app
- On-Demand & Scheduled Rides: Book instant or pre-scheduled rides
- Pooling & Ride-Sharing Options: Share rides to reduce costs
- Integration with Public Transport: View real-time schedules of connecting transport

## Tech Stack

This project is built with the MERN stack:

- **MongoDB**: Database for storing user profiles, parking lots, bookings, and rides
- **Express.js**: Backend API framework
- **React**: Frontend user interface
- **Node.js**: Server-side runtime

Additional technologies:
- Material UI for frontend components
- JWT for authentication
- QR Code generation for contactless entry
- Geospatial queries for location-based searches

## Project Structure

```
.
├── backend/                  # Node.js API with Express
│   ├── src/
│   │   ├── config/           # Configuration files 
│   │   ├── controllers/      # API controllers
│   │   ├── middlewares/      # Custom middlewares
│   │   ├── models/           # MongoDB models with Mongoose
│   │   ├── routes/           # API routes
│   │   └── utils/            # Utility functions
│   ├── .env                  # Environment variables
│   └── package.json          # Backend dependencies
├── frontend/                 # React frontend
│   ├── public/               # Static files
│   ├── src/
│   │   ├── assets/           # Images, fonts, etc.
│   │   ├── components/       # Reusable React components
│   │   ├── context/          # React Context providers
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service connectors
│   │   └── utils/            # Utility functions
│   └── package.json          # Frontend dependencies
└── README.md                 # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14.x or higher)
- MongoDB (v4.x or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/park-and-ride.git
cd park-and-ride
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the backend directory based on the `.env.example` file

4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend development server:

```bash
cd frontend
npm start
```

3. Access the application at `http://localhost:3000`

## API Documentation

The API supports the following main endpoints:

- `/api/users` - User registration, authentication, and profile management
- `/api/parking` - Parking lot listing, spot availability, and booking management
- `/api/rides` - Ride types, booking, and ride management

For detailed API documentation, refer to the API docs when the server is running at `http://localhost:5000/api-docs`

## Future Enhancements

- Mobile apps for iOS and Android
- Real-time tracking of shuttle services
- Integration with payment gateways
- Advanced analytics for parking utilization
- IoT integration for automated parking gates

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please contact support@parkandride.com 