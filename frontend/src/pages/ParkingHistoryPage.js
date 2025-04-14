import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DirectionsIcon from '@mui/icons-material/Directions';
import HistoryIcon from '@mui/icons-material/History';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RateReviewIcon from '@mui/icons-material/RateReview';

// Sample booking history data
const bookingHistory = [
  {
    id: 'BK-12345',
    parkingLotId: 1,
    parkingLotName: 'Central Metro Parking',
    address: '123 Main Street, Downtown',
    date: new Date(2023, 9, 15), // October 15, 2023
    startTime: new Date(2023, 9, 15, 9, 0), // 9:00 AM
    endTime: new Date(2023, 9, 15, 17, 0), // 5:00 PM
    duration: 8,
    cost: 40,
    status: 'completed',
    vehicle: {
      licensePlate: 'ABC123',
      make: 'Toyota',
      model: 'Camry',
      color: 'Silver'
    },
    paymentMethod: 'Credit Card'
  },
  {
    id: 'BK-12346',
    parkingLotId: 2,
    parkingLotName: 'Westside Park & Ride',
    address: '456 West Avenue, Westside',
    date: new Date(2023, 9, 20), // October 20, 2023
    startTime: new Date(2023, 9, 20, 8, 30), // 8:30 AM
    endTime: new Date(2023, 9, 20, 16, 30), // 4:30 PM
    duration: 8,
    cost: 32,
    status: 'completed',
    vehicle: {
      licensePlate: 'ABC123',
      make: 'Toyota',
      model: 'Camry',
      color: 'Silver'
    },
    paymentMethod: 'PayPal'
  },
  {
    id: 'BK-12350',
    parkingLotId: 3,
    parkingLotName: 'Eastside Metro Garage',
    address: '789 East Street, Eastside',
    date: new Date(), // Today
    startTime: new Date(new Date().setHours(10, 0, 0, 0)), // 10:00 AM today
    endTime: new Date(new Date().setHours(14, 0, 0, 0)), // 2:00 PM today
    duration: 4,
    cost: 24,
    status: 'active',
    vehicle: {
      licensePlate: 'ABC123',
      make: 'Toyota',
      model: 'Camry',
      color: 'Silver'
    },
    paymentMethod: 'Credit Card'
  },
  {
    id: 'BK-12355',
    parkingLotId: 4,
    parkingLotName: 'Northside Commuter Lot',
    address: '234 North Road, Northside',
    date: new Date(new Date().getTime() + 86400000), // Tomorrow
    startTime: new Date(new Date().getTime() + 86400000 + 9 * 3600000), // 9:00 AM tomorrow
    endTime: new Date(new Date().getTime() + 86400000 + 17 * 3600000), // 5:00 PM tomorrow
    duration: 8,
    cost: 24,
    status: 'upcoming',
    vehicle: {
      licensePlate: 'ABC123',
      make: 'Toyota',
      model: 'Camry',
      color: 'Silver'
    },
    paymentMethod: 'Credit Card'
  }
];

const ParkingHistoryPage = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filter bookings based on the tab
  const filteredBookings = () => {
    if (tabValue === 0) return bookings; // All
    if (tabValue === 1) return bookings.filter(booking => booking.status === 'active'); // Active
    if (tabValue === 2) return bookings.filter(booking => booking.status === 'upcoming'); // Upcoming
    if (tabValue === 3) return bookings.filter(booking => booking.status === 'completed'); // Past
    return bookings;
  };

  // Simulate API call to fetch booking history
  useEffect(() => {
    setTimeout(() => {
      setBookings(bookingHistory);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const handleExtendBooking = (bookingId) => {
    // Logic to extend booking
    alert(`Extending booking ${bookingId}`);
  };

  const handleCancelBooking = (bookingId) => {
    // Logic to cancel booking
    alert(`Cancelling booking ${bookingId}`);
  };

  const handleGetDirections = (bookingId) => {
    // Logic to get directions
    navigate(`/directions/${bookingId}`);
  };

  const handleViewReceipt = (bookingId) => {
    // Logic to view receipt
    navigate(`/receipt/${bookingId}`);
  };

  const handleLeaveReview = (parkingLotId) => {
    // Logic to leave a review
    navigate(`/review/${parkingLotId}`);
  };

  // Status chip color mapping
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'info';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  // Format date display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time display
  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading your parking history...</Typography>
      </Container>
    );
  }

  if (showDetails && selectedBooking) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Booking Details
            </Typography>
            <Button onClick={handleCloseDetails}>
              Back to History
            </Button>
          </Box>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {selectedBooking.id}
                    </Typography>
                    <Chip 
                      label={selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)} 
                      color={getStatusChipColor(selectedBooking.status)} 
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {selectedBooking.parkingLotName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedBooking.address}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {formatDate(selectedBooking.date)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Duration: {selectedBooking.duration} hours
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vehicle Information
                  </Typography>
                  <Typography variant="body1">
                    {selectedBooking.vehicle.make} {selectedBooking.vehicle.model}, {selectedBooking.vehicle.color}
                  </Typography>
                  <Typography variant="body1">
                    License Plate: {selectedBooking.vehicle.licensePlate}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payment Information
                  </Typography>
                  <Typography variant="body1">
                    Total Amount: ${selectedBooking.cost.toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    Payment Method: {selectedBooking.paymentMethod}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
                  {selectedBooking.status === 'completed' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<ReceiptIcon />}
                        onClick={() => handleViewReceipt(selectedBooking.id)}
                      >
                        Receipt
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<RateReviewIcon />}
                        onClick={() => handleLeaveReview(selectedBooking.parkingLotId)}
                      >
                        Review
                      </Button>
                    </Box>
                  )}

                  {selectedBooking.status === 'active' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleExtendBooking(selectedBooking.id)}
                      >
                        Extend
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<DirectionsIcon />}
                        onClick={() => handleGetDirections(selectedBooking.id)}
                      >
                        Directions
                      </Button>
                    </Box>
                  )}

                  {selectedBooking.status === 'upcoming' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        color="error"
                        onClick={() => handleCancelBooking(selectedBooking.id)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<DirectionsIcon />}
                        onClick={() => handleGetDirections(selectedBooking.id)}
                      >
                        Directions
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Parking History
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="All Bookings" />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Active
              {bookings.filter(b => b.status === 'active').length > 0 && (
                <Chip 
                  size="small" 
                  label={bookings.filter(b => b.status === 'active').length} 
                  color="success"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          } />
          <Tab label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Upcoming
              {bookings.filter(b => b.status === 'upcoming').length > 0 && (
                <Chip 
                  size="small" 
                  label={bookings.filter(b => b.status === 'upcoming').length} 
                  color="info"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          } />
          <Tab label="Past" />
        </Tabs>
      </Paper>

      {filteredBookings().length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LocalParkingIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            You don't have any {tabValue === 0 ? '' : tabValue === 1 ? 'active' : tabValue === 2 ? 'upcoming' : 'past'} parking bookings.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/parking/search')}
          >
            Find Parking
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings().map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{formatDate(booking.date)}</TableCell>
                  <TableCell>
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={booking.address}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {booking.parkingLotName}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                      color={getStatusChipColor(booking.status)}
                    />
                  </TableCell>
                  <TableCell>${booking.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewDetails(booking)}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {booking.status === 'active' && (
                        <Tooltip title="Get Directions">
                          <IconButton 
                            size="small"
                            onClick={() => handleGetDirections(booking.id)}
                          >
                            <DirectionsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {booking.status === 'completed' && (
                        <Tooltip title="View Receipt">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewReceipt(booking.id)}
                          >
                            <ReceiptIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ParkingHistoryPage; 