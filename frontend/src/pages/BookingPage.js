import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventIcon from '@mui/icons-material/Event';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// Sample parking lot data
const parkingLots = [
  {
    id: 1,
    name: 'Central Metro Parking',
    address: '123 Main Street, Downtown',
    distance: 0.5,
    rating: 4.5,
    totalSpots: 200,
    availableSpots: 45,
    price: { hourly: 5, daily: 25 },
    operatingHours: '24 hours',
    amenities: ['EV Charging', 'Handicap Access', 'CCTV'],
    nearbyMetro: 'Central Station',
    image: 'https://source.unsplash.com/random/?parking'
  },
  {
    id: 2,
    name: 'Westside Park & Ride',
    address: '456 West Avenue, Westside',
    distance: 1.2,
    rating: 4.2,
    totalSpots: 150,
    availableSpots: 20,
    price: { hourly: 4, daily: 20 },
    operatingHours: '5:00 AM - 11:00 PM',
    amenities: ['Covered Parking', 'Handicap Access'],
    nearbyMetro: 'Westside Station',
    image: 'https://source.unsplash.com/random/?garage'
  },
  {
    id: 3,
    name: 'Eastside Metro Garage',
    address: '789 East Street, Eastside',
    distance: 0.8,
    rating: 4.7,
    totalSpots: 300,
    availableSpots: 100,
    price: { hourly: 6, daily: 30 },
    operatingHours: '24 hours',
    amenities: ['EV Charging', 'Car Wash', 'Security Guards'],
    nearbyMetro: 'Eastside Central',
    image: 'https://source.unsplash.com/random/?carpark'
  },
  {
    id: 4,
    name: 'Northside Commuter Lot',
    address: '234 North Road, Northside',
    distance: 1.5,
    rating: 3.8,
    totalSpots: 120,
    availableSpots: 55,
    price: { hourly: 3, daily: 15 },
    operatingHours: '6:00 AM - 10:00 PM',
    amenities: ['Open Air', 'Budget Friendly'],
    nearbyMetro: 'North Station',
    image: 'https://source.unsplash.com/random/?carparking'
  }
];

const steps = ['Parking Details', 'Vehicle Information', 'Payment', 'Confirmation'];

const BookingPage = () => {
  const { parkingId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState({
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 3600000), // 1 hour later
    duration: 1,
    vehicleInfo: {
      licensePlate: '',
      make: '',
      model: '',
      color: ''
    },
    paymentMethod: 'creditCard',
    cardInfo: {
      cardNumber: '',
      nameOnCard: '',
      expiryDate: '',
      cvv: ''
    }
  });
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // Calculate total cost
  const calculateCost = () => {
    if (!selectedParkingLot) return 0;
    return selectedParkingLot.price.hourly * bookingDetails.duration;
  };

  // Update end time when start time or duration changes
  useEffect(() => {
    if (bookingDetails.startTime) {
      const endTime = new Date(bookingDetails.startTime.getTime() + (bookingDetails.duration * 60 * 60 * 1000));
      setBookingDetails(prev => ({
        ...prev,
        endTime
      }));
    }
  }, [bookingDetails.startTime, bookingDetails.duration]);

  // Fetch parking lot details
  useEffect(() => {
    // Simulate API call to get parking lot details
    setTimeout(() => {
      const lot = parkingLots.find(lot => lot.id.toString() === parkingId);
      if (lot) {
        setSelectedParkingLot(lot);
      } else {
        // Handle invalid parking lot ID
        navigate('/parking/search');
      }
      setIsLoading(false);
    }, 800);
  }, [parkingId, navigate]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Submit booking
      submitBooking();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingDetails(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setBookingDetails(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDurationChange = (e) => {
    const duration = parseInt(e.target.value, 10);
    setBookingDetails(prev => ({
      ...prev,
      duration
    }));
  };

  const handleDateChange = (date) => {
    setBookingDetails(prev => ({
      ...prev,
      date
    }));
  };

  const handleTimeChange = (time) => {
    setBookingDetails(prev => ({
      ...prev,
      startTime: time
    }));
  };

  const submitBooking = () => {
    setIsLoading(true);
    // Simulate API call to create booking
    setTimeout(() => {
      // Generate a random confirmation number
      const confirmationNumber = Math.random().toString(36).substring(2, 10).toUpperCase();
      setBookingConfirmation({
        confirmationNumber,
        parkingLot: selectedParkingLot,
        details: bookingDetails,
        cost: calculateCost(),
        date: new Date()
      });
      setBookingComplete(true);
      setIsLoading(false);
    }, 1500);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading booking information...</Typography>
      </Container>
    );
  }

  if (bookingComplete) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h4" gutterBottom>
              Booking Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your parking spot has been reserved. Check your email for details.
            </Typography>
          </Box>

          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ConfirmationNumberIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Confirmation: {bookingConfirmation.confirmationNumber}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Parking Location
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {bookingConfirmation.parkingLot.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bookingConfirmation.parkingLot.address}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {bookingConfirmation.details.date.toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {bookingConfirmation.details.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {bookingConfirmation.details.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vehicle Information
                  </Typography>
                  <Typography variant="body1">
                    License Plate: {bookingConfirmation.details.vehicleInfo.licensePlate}
                  </Typography>
                  <Typography variant="body1">
                    {bookingConfirmation.details.vehicleInfo.make} {bookingConfirmation.details.vehicleInfo.model}, {bookingConfirmation.details.vehicleInfo.color}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payment Information
                  </Typography>
                  <Typography variant="body1">
                    Total Amount: ${bookingConfirmation.cost.toFixed(2)}
                  </Typography>
                  <Typography variant="body1">
                    Payment Method: {bookingConfirmation.details.paymentMethod === 'creditCard' ? 'Credit Card' : 'PayPal'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="contained"
              onClick={() => navigate('/parking/search')}
            >
              Book Another Spot
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Parking Details
            </Typography>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Typography variant="h6">
                      {selectedParkingLot.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {selectedParkingLot.address}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                      <Chip size="small" label={`${selectedParkingLot.availableSpots} spots available`} color="success" />
                      <Chip size="small" label={`$${selectedParkingLot.price.hourly}/hr`} />
                      <Chip size="small" label={selectedParkingLot.operatingHours} />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography variant="h5" color="primary">
                        ${selectedParkingLot.price.hourly}/hr
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${selectedParkingLot.price.daily}/day
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={bookingDetails.date}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    minDate={new Date()}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Start Time"
                    value={bookingDetails.startTime}
                    onChange={handleTimeChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Duration</FormLabel>
                  <RadioGroup 
                    row 
                    name="duration" 
                    value={bookingDetails.duration.toString()} 
                    onChange={handleDurationChange}
                  >
                    <FormControlLabel value="1" control={<Radio />} label="1 hour" />
                    <FormControlLabel value="2" control={<Radio />} label="2 hours" />
                    <FormControlLabel value="4" control={<Radio />} label="4 hours" />
                    <FormControlLabel value="8" control={<Radio />} label="8 hours" />
                    <FormControlLabel value="12" control={<Radio />} label="12 hours" />
                    <FormControlLabel value="24" control={<Radio />} label="All day (24h)" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ background: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Summary:
                  </Typography>
                  <Typography variant="body2">
                    {bookingDetails.date.toLocaleDateString()} from {bookingDetails.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {bookingDetails.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Total: ${calculateCost().toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Vehicle Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="License Plate Number"
                  name="vehicleInfo.licensePlate"
                  value={bookingDetails.vehicleInfo.licensePlate}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Vehicle Make"
                  name="vehicleInfo.make"
                  placeholder="e.g. Toyota"
                  value={bookingDetails.vehicleInfo.make}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Vehicle Model"
                  name="vehicleInfo.model"
                  placeholder="e.g. Camry"
                  value={bookingDetails.vehicleInfo.model}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Vehicle Color"
                  name="vehicleInfo.color"
                  placeholder="e.g. Silver"
                  value={bookingDetails.vehicleInfo.color}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Your vehicle information is required to identify your car in the parking lot.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Payment Information
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Payment Method</FormLabel>
                <RadioGroup 
                  row 
                  name="paymentMethod" 
                  value={bookingDetails.paymentMethod} 
                  onChange={handleInputChange}
                >
                  <FormControlLabel 
                    value="creditCard" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCardIcon sx={{ mr: 1 }} /> Credit Card
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="paypal" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalAtmIcon sx={{ mr: 1 }} /> PayPal
                      </Box>
                    } 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
            
            {bookingDetails.paymentMethod === 'creditCard' && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Card Number"
                    name="cardInfo.cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={bookingDetails.cardInfo.cardNumber}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Name on Card"
                    name="cardInfo.nameOnCard"
                    value={bookingDetails.cardInfo.nameOnCard}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Expiry Date"
                    name="cardInfo.expiryDate"
                    placeholder="MM/YY"
                    value={bookingDetails.cardInfo.expiryDate}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="CVV"
                    name="cardInfo.cvv"
                    type="password"
                    value={bookingDetails.cardInfo.cvv}
                    onChange={handleInputChange}
                  />
                </Grid>
              </Grid>
            )}
            
            {bookingDetails.paymentMethod === 'paypal' && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  You will be redirected to PayPal to complete your payment after reviewing your booking.
                </Alert>
                <Button variant="outlined" startIcon={<LocalAtmIcon />}>
                  Connect with PayPal
                </Button>
              </Box>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ background: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LocalParkingIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={selectedParkingLot.name} 
                    secondary={`${bookingDetails.duration} hour${bookingDetails.duration > 1 ? 's' : ''}`} 
                  />
                  <Typography variant="body1">
                    ${calculateCost().toFixed(2)}
                  </Typography>
                </ListItem>
              </List>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="subtitle1">Total</Typography>
                <Typography variant="h6">${calculateCost().toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>
        )}

        {activeStep === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Review Your Booking
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {selectedParkingLot.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedParkingLot.address}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body1">
                      {bookingDetails.date.toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">
                      {bookingDetails.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {bookingDetails.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Duration: {bookingDetails.duration} hour{bookingDetails.duration > 1 ? 's' : ''}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Vehicle Information
                    </Typography>
                    <Typography variant="body1">
                      License Plate: {bookingDetails.vehicleInfo.licensePlate}
                    </Typography>
                    <Typography variant="body1">
                      {bookingDetails.vehicleInfo.make} {bookingDetails.vehicleInfo.model}, {bookingDetails.vehicleInfo.color}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Payment Information
                    </Typography>
                    <Typography variant="body1">
                      Method: {bookingDetails.paymentMethod === 'creditCard' ? 'Credit Card' : 'PayPal'}
                    </Typography>
                    {bookingDetails.paymentMethod === 'creditCard' && (
                      <Typography variant="body1">
                        Card: **** **** **** {bookingDetails.cardInfo.cardNumber.slice(-4)}
                      </Typography>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">Total Amount</Typography>
                      <Typography variant="h6">${calculateCost().toFixed(2)}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              By proceeding with the booking, you agree to our Terms and Conditions and Cancellation Policy.
            </Alert>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && (!bookingDetails.date || !bookingDetails.startTime)) ||
              (activeStep === 1 && (!bookingDetails.vehicleInfo.licensePlate || !bookingDetails.vehicleInfo.make || !bookingDetails.vehicleInfo.model || !bookingDetails.vehicleInfo.color)) ||
              (activeStep === 2 && bookingDetails.paymentMethod === 'creditCard' && (!bookingDetails.cardInfo.cardNumber || !bookingDetails.cardInfo.nameOnCard || !bookingDetails.cardInfo.expiryDate || !bookingDetails.cardInfo.cvv))
            }
          >
            {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingPage; 