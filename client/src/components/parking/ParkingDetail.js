import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Container,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Chip,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  IconButton,
  CircularProgress,
  Snackbar,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SecurityIcon from '@mui/icons-material/Security';
import WifiIcon from '@mui/icons-material/Wifi';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QrCodeIcon from '@mui/icons-material/QrCode';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import NfcIcon from '@mui/icons-material/Nfc';

const ParkingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [parkingSpot, setParkingSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingInfo, setBookingInfo] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 2,
    vehicleType: 'car',
    vehicleRegistration: '',
    vehicleColor: '',
    vehicleModel: '',
    bookingType: 'hourly',
    paymentMethod: 'credit'
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login', { state: { from: `/parking/${id}`, message: 'Please login to book a parking spot' } });
    }
  }, [id, navigate]);

  // Fetch parking spot details
  useEffect(() => {
    const fetchParkingSpot = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        // Make an actual API call to fetch the parking spot
        const response = await axios.get(`/api/parking/spots/${id}`, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        });
        
        if (response.data.success) {
          setParkingSpot(response.data.data);
        } else {
          setError('Failed to load parking spot details');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching parking spot:', err);
        setError('Failed to load parking spot details');
        setLoading(false);
      }
    };

    fetchParkingSpot();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBooking = async () => {
    if (!validateForm()) {
      return;
    }

    setBookingLoading(true);
    setErrorMessage('');

    try {
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login', { state: { from: `/parking/${id}` } });
        return;
      }

      // Calculate start and end times
      const [hours, minutes] = bookingInfo.time.split(':');
      const startDate = new Date(bookingInfo.date);
      startDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      
      const endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + parseInt(bookingInfo.duration, 10));

      // Prepare the data for the API call
      const bookingData = {
        parkingSpot: parkingSpot._id, // Use the MongoDB ObjectId instead of the URL param id
        vehicleDetails: {
          model: bookingInfo.vehicleModel,
          color: bookingInfo.vehicleColor,
          registrationNumber: bookingInfo.vehicleRegistration
        },
        bookingType: 'hourly', // Can be expanded to offer daily/monthly options
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        paymentMethod: bookingInfo.paymentMethod
      };

      console.log('Sending booking data:', bookingData);

      // Make API call to create booking
      const response = await axios.post('/api/bookings', bookingData, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });

      console.log('Booking response:', response.data);

      if (response.data.success) {
        setBooked(true);
        
        // Update parking spot availability locally
        setParkingSpot(prev => ({
          ...prev,
          availableSpots: Math.max(0, prev.availableSpots - 1)
        }));
        
        // After successful booking, redirect to bookings page
        setTimeout(() => {
          navigate('/bookings', { 
            state: { 
              message: 'Your parking spot has been booked successfully! Please proceed to payment.',
              bookingId: response.data.data.bookingCode || response.data.data._id
            } 
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Booking error:', error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Failed to book parking spot');
      } else {
        setErrorMessage('Network error. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const validateForm = () => {
    if (!bookingInfo.vehicleRegistration) {
      setErrorMessage('Please enter your vehicle registration number');
      return false;
    }
    if (!bookingInfo.vehicleModel) {
      setErrorMessage('Please enter your vehicle model');
      return false;
    }
    if (!bookingInfo.vehicleColor) {
      setErrorMessage('Please enter your vehicle color');
      return false;
    }
    return true;
  };

  const renderFacilityIcon = (facility) => {
    switch(facility) {
      case 'security-guard': return <SecurityIcon titleAccess="24/7 Security" />;
      case 'cctv': return <SecurityIcon titleAccess="CCTV Surveillance" />;
      case 'covered': return <DirectionsCarIcon titleAccess="Covered Parking" />;
      case 'disabled-access': return <AccessibleIcon titleAccess="Disabled Access" />;
      case 'electric-charging': return <ElectricCarIcon titleAccess="EV Charging" />;
      case 'wifi': return <WifiIcon titleAccess="Free WiFi" />;
      case 'car-wash': return <DirectionsCarIcon titleAccess="Car Wash" />;
      default: return null;
    }
  };

  // Calculate total based on booking type and duration
  const calculateTotal = () => {
    if (!parkingSpot) return 0;

    let total = 0;
    const duration = parseInt(bookingInfo.duration);

    // Calculate based on booking type
    switch (bookingInfo.bookingType) {
      case 'hourly':
        total = parkingSpot.hourlyRate * duration;
        break;
      case 'daily':
        total = parkingSpot.dailyRate * Math.ceil(duration / 24);
        break;
      case 'monthly':
        total = parkingSpot.monthlyRate;
        break;
      default:
        total = parkingSpot.hourlyRate * duration;
    }

    // Add tax (18%)
    total = total * 1.18;

    return Math.round(total);
  };

  // Render the booking form
  const renderBookingForm = () => {
    return (
      <Card elevation={3} sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Book Parking Spot</Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {/* Date and Time Selection */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={bookingInfo.date}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Time"
                name="time"
                type="time"
                value={bookingInfo.time}
                onChange={handleChange}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Duration (hours)</InputLabel>
                <Select
                  name="duration"
                  value={bookingInfo.duration}
                  onChange={handleChange}
                  label="Duration (hours)"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 8, 12, 24].map(hour => (
                    <MenuItem key={hour} value={hour}>{hour} hour{hour > 1 ? 's' : ''}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Vehicle Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Vehicle Details</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Registration Number"
                name="vehicleRegistration"
                value={bookingInfo.vehicleRegistration}
                onChange={handleChange}
                variant="outlined"
                required
                placeholder="e.g., MH01AB1234"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Vehicle Type</InputLabel>
                <Select
                  name="vehicleType"
                  value={bookingInfo.vehicleType}
                  onChange={handleChange}
                  label="Vehicle Type"
                  required
                >
                  <MenuItem value="car">Car</MenuItem>
                  <MenuItem value="suv">SUV</MenuItem>
                  <MenuItem value="bike">Bike/Motorcycle</MenuItem>
                  <MenuItem value="ev">Electric Vehicle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Model"
                name="vehicleModel"
                value={bookingInfo.vehicleModel}
                onChange={handleChange}
                variant="outlined"
                required
                placeholder="e.g., Honda City"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Vehicle Color"
                name="vehicleColor"
                value={bookingInfo.vehicleColor}
                onChange={handleChange}
                variant="outlined"
                required
                placeholder="e.g., White"
              />
            </Grid>

            {/* Contactless Entry Options */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Contactless Entry Options</Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Enable contactless entry at the parking gate for a seamless experience
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={bookingInfo.enableLPR || false} 
                    onChange={(e) => setBookingInfo({...bookingInfo, enableLPR: e.target.checked})}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VideoCameraBackIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body1">License Plate Recognition (LPR)</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Cameras will recognize your license plate for automatic entry
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={bookingInfo.enableRFID || false} 
                    onChange={(e) => setBookingInfo({...bookingInfo, enableRFID: e.target.checked})}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NfcIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body1">RFID Tag</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Collect an RFID tag at the entry for contactless access
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={bookingInfo.enableQR || false} 
                    onChange={(e) => setBookingInfo({...bookingInfo, enableQR: e.target.checked})}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <QrCodeIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body1">QR Code</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Receive a QR code for scanning at entry/exit points
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </Grid>
            
            {/* Payment Options */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Payment Method</Typography>
            </Grid>
            <Grid item xs={12} md={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Payment Method</InputLabel>
                <Select
                  name="paymentMethod"
                  value={bookingInfo.paymentMethod}
                  onChange={handleChange}
                  label="Payment Method"
                  required
                >
                  <MenuItem value="credit">Credit Card</MenuItem>
                  <MenuItem value="debit">Debit Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="wallet">Digital Wallet</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Booking Summary */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Booking Summary</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Parking Charges:</Typography>
                    <Typography variant="body1">₹{parkingSpot?.hourlyRate} x {bookingInfo.duration} hours</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">GST (18%):</Typography>
                    <Typography variant="body1">₹{Math.round(parkingSpot?.hourlyRate * bookingInfo.duration * 0.18)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', mt: 1 }}>
                    <Typography variant="h6">Total Amount:</Typography>
                    <Typography variant="h6">₹{calculateTotal()}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            {/* Error Messages */}
            {errorMessage && (
              <Grid item xs={12}>
                <Alert severity="error">{errorMessage}</Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleBooking}
                disabled={bookingLoading || booked}
                startIcon={bookingLoading ? <CircularProgress size={20} /> : null}
              >
                {bookingLoading ? 'Processing...' : booked ? 'Booked Successfully!' : 'Book Now'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !parkingSpot) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 3 }}>
          <Alert severity="error">{error || 'Parking spot not found'}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/parking')}
            sx={{ mt: 2 }}
          >
            Back to Parking List
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/parking')}
          sx={{ mb: 2 }}
        >
          Back to Parking List
        </Button>

        {booked && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Your parking spot has been booked successfully! Redirecting to My Bookings...
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Card elevation={3}>
              <CardMedia
                component="img"
                height="300"
                image={parkingSpot.images && parkingSpot.images.length > 0 ? parkingSpot.images[0] : "https://via.placeholder.com/800x300?text=No+Image"}
                alt={parkingSpot.name}
              />
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  {parkingSpot.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {parkingSpot.location?.address?.street}, {parkingSpot.location?.address?.city}, {parkingSpot.location?.address?.state} - {parkingSpot.location?.address?.zipCode}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={parkingSpot.ratings?.average || 0} precision={0.5} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({parkingSpot.ratings?.average || 0})
                  </Typography>
                  <Chip 
                    label={`${parkingSpot.availableSpots}/${parkingSpot.totalSpots} spots available`}
                    color={parkingSpot.availableSpots < 5 ? "warning" : "success"}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
                
                <Typography variant="body1" paragraph>
                  {parkingSpot.description || `Conveniently located ${parkingSpot.name} offers easy access to metro stations and major attractions. This parking facility is ${parkingSpot.type} type with ${parkingSpot.totalSpots} total spots.`}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Facilities
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {parkingSpot.amenities && parkingSpot.amenities.map((facility, index) => (
                      <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ color: 'primary.main' }}>
                          {renderFacilityIcon(facility)}
                        </Box>
                        <Typography variant="caption">
                          {facility.charAt(0).toUpperCase() + facility.slice(1).replace(/-/g, ' ')}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Operating Hours
                          </Typography>
                          <Typography variant="body1">
                            {parkingSpot.operatingHours?.openTime || '06:00'} - {parkingSpot.operatingHours?.closeTime || '22:00'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyIcon color="action" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Hourly Rate
                          </Typography>
                          <Typography variant="body1">
                            ₹{parkingSpot.hourlyRate}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Reviews
                  </Typography>
                  {parkingSpot.reviews ? (
                    parkingSpot.reviews.map((review, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2">{review.user}</Typography>
                          <Rating value={review.rating} size="small" readOnly sx={{ ml: 1 }} />
                        </Box>
                        <Typography variant="body2">{review.comment}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2">No reviews yet.</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Book Your Parking Spot
              </Typography>
              
              {renderBookingForm()}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ParkingDetail; 