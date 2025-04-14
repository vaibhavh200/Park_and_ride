// Import Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const parkingRoutes = require('./routes/parking.routes');
const bookingRoutes = require('./routes/booking.routes');
const rideRoutes = require('./routes/ride.routes');
const multimodalRoutes = require('./routes/multimodal.routes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parkings', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/multimodal', multimodalRoutes); 