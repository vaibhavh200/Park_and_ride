import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent
} from '@mui/material';
import {
  LocalTaxi as TaxiIcon,
  AirportShuttle as ShuttleIcon,
  ElectricRickshaw as RickshawIcon,
  DirectionsCar as AutoIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  LocalOffer as OfferIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const RideBooking = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeStep, setActiveStep] = useState(0);
  const [rideService, setRideService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [metroStations, setMetroStations] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    pickupLocation: {
      address: '',
      coordinates: [0, 0]
    },
    dropoffLocation: {
      address: '',
      coordinates: [0, 0]
    },
    distance: 0,
    estimatedDuration: 0,
    passengers: 1,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    paymentMethod: 'credit'
  });
  
  // Fare calculation
  const [fareDetails, setFareDetails] = useState({
    baseFare: 0,
    distanceFare: 0,
    timeFare: 0,
    tax: 0,
    discount: 0,
    totalFare: 0
  });
  
  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login', { 
        state: { 
          from: `/rides/book/${serviceId}`,
          message: 'Please login to book a ride'
        }
      });
      return;
    }
  }, [serviceId, navigate]);
  
  // Fetch ride service details
  useEffect(() => {
    const fetchRideService = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          navigate('/login', { 
            state: { 
              from: `/rides/book/${serviceId}`,
              message: 'Please login to book a ride'
            }
          });
          return;
        }

        console.log('Fetching ride service with ID:', serviceId);
        
        const response = await axios.get(`/api/rides/services/${serviceId}`, {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        console.log('Response from server:', response.data);

        if (response.data.success && response.data.data) {
          console.log('Setting ride service data:', response.data.data);
          setRideService(response.data.data);
          setError(null);
          
          // Initialize form data with service-specific defaults
          setFormData(prev => ({
            ...prev,
            passengers: Math.min(prev.passengers, response.data.data.maxPassengers || 4)
          }));
        } else {
          console.error('Invalid response format:', response.data);
          setError(response.data.message || 'Failed to load ride service details');
        }
      } catch (err) {
        console.error('Error fetching ride service:', err);
        if (err.response?.status === 401) {
          navigate('/login', { 
            state: { 
              from: `/rides/book/${serviceId}`,
              message: 'Your session has expired. Please login again.'
            }
          });
        } else if (err.response?.status === 404) {
          setError('Ride service not found. Please try selecting a different service.');
        } else {
          setError(err.response?.data?.message || 'Failed to load ride service details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRideService();
  }, [serviceId, navigate]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch metro stations for dropdown
        const stationsResponse = await axios.get('/api/metro/stations');
        
        if (stationsResponse.data.success) {
          setMetroStations(stationsResponse.data.data);
        }
        
        // Update initial fare calculation
        calculateFare(rideService, formData);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 404) {
          setError('Ride service not found. Please try selecting a different service.');
        } else {
          setError(err.response?.data?.message || 'Failed to load ride booking data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [serviceId, rideService]);
  
  // Recalculate fare when relevant form fields change
  useEffect(() => {
    if (rideService) {
      calculateFare(rideService, formData);
    }
  }, [
    formData.distance, 
    formData.estimatedDuration, 
    formData.passengers,
    rideService
  ]);
  
  // Update form data from search params in URL
  useEffect(() => {
    if (location.state && location.state.searchParams) {
      const { searchParams } = location.state;
      
      const pickupLocation = searchParams.pickup || 'Central Metro Station';
      const dropoffLocation = searchParams.dropoff || 'Tech Park';
      
      // Default coordinates for demo locations
      const defaultCoordinates = {
        'Central Metro Station': { lat: 12.9716, lng: 77.5946 },
        'Tech Park': { lat: 12.9783, lng: 77.6408 }
      };
      
      const pickupCoords = defaultCoordinates[pickupLocation] || { lat: 12.9716, lng: 77.5946 };
      const dropoffCoords = defaultCoordinates[dropoffLocation] || { lat: 12.9783, lng: 77.6408 };
      
      setFormData(prev => ({
        ...prev,
        pickupLocation: {
          address: pickupLocation,
          coordinates: [pickupCoords.lng, pickupCoords.lat]
        },
        dropoffLocation: {
          address: dropoffLocation,
          coordinates: [dropoffCoords.lng, dropoffCoords.lat]
        },
        passengers: searchParams.passengers || 1,
        scheduledDate: searchParams.date || prev.scheduledDate,
        scheduledTime: searchParams.time || prev.scheduledTime
      }));
    }
  }, [location.state]);
  
  const calculateFare = (service, data) => {
    if (!service) return;
    
    // Use consistent property names from the service
    const baseFare = service.baseFare || service.basePrice || 100;
    const perKmRate = service.perKilometerRate || service.pricePerKm || 10;
    const perMinuteRate = service.perMinuteRate || 1;
    const minFare = service.minimumFare || service.minFare || 50;
    
    const distanceFare = perKmRate * data.distance;
    const timeFare = perMinuteRate * data.estimatedDuration;
    
    // Calculate tax (18%)
    const subtotal = baseFare + distanceFare + timeFare;
    const tax = subtotal * 0.18;
    
    // Calculate total fare with minimum fare
    const totalFare = Math.max(minFare, subtotal + tax);
    
    setFareDetails({
      baseFare,
      distanceFare,
      timeFare,
      tax,
      discount: 0,
      totalFare
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLocationChange = (type, field, value) => {
    setFormData(prev => {
      const updatedData = { ...prev };
      
      if (field === 'address') {
        updatedData[type] = {
          ...updatedData[type],
          address: value
        };
        
        // Update coordinates based on address (simplified for demo)
        // In a real app, this would use a geocoding service
        const coordinates = getCoordinatesFromAddress(value);
        updatedData[type].coordinates = [coordinates.lng, coordinates.lat]; // Note: MongoDB uses [lng, lat] order
      }
      
      return updatedData;
    });
  };
  
  // Simple function to get mock coordinates from address
  const getCoordinatesFromAddress = (address) => {
    // This is just a mock function - in a real app, you would use a geocoding service
    const coordinates = {
      'Central Metro Station': { lat: 28.6139, lng: 77.2090 },
      'Tech Park': { lat: 28.6184, lng: 77.3810 },
      'Business District': { lat: 28.5493, lng: 77.1994 },
      'Residential Area': { lat: 28.6692, lng: 77.4538 },
      'Airport': { lat: 28.5562, lng: 77.1000 },
      'Shopping Mall': { lat: 28.6430, lng: 77.2209 },
      'University': { lat: 28.5890, lng: 77.1760 },
      'Hospital': { lat: 28.6127, lng: 77.2773 },
      'Nearby Market': { lat: 28.6100, lng: 77.2500 }
    };
    
    // Return Central Metro coordinates as default if address doesn't match
    return coordinates[address] || { lat: 28.6139, lng: 77.2090 };
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        navigate('/login', { 
          state: { 
            from: `/rides/book/${serviceId}`,
            message: 'Please login to book a ride'
          }
        });
        return;
      }
      
      // Validate form data
      if (!formData.pickupLocation.address || !formData.dropoffLocation.address) {
        setError('Please provide both pickup and dropoff locations');
        setSubmitting(false);
        return;
      }
      
      if (formData.distance <= 0) {
        setError('Please provide a valid distance');
        setSubmitting(false);
        return;
      }
      
      if (formData.estimatedDuration <= 0) {
        setError('Please provide a valid estimated duration');
        setSubmitting(false);
        return;
      }
      
      // Combine date and time into a proper ISO date string
      const pickupTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      // Format data according to the server's expected structure
      const bookingDataToSend = {
        rideService: serviceId,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
        distance: formData.distance,
        estimatedDuration: formData.estimatedDuration,
        numberOfPassengers: formData.passengers,
        pickupTime: pickupTime.toISOString(),
        paymentMethod: formData.paymentMethod
      };
      
      console.log("Sending booking data:", bookingDataToSend);
      
      const response = await axios.post(
        '/api/rides/bookings',
        bookingDataToSend,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Navigate to booking confirmation page
        navigate(`/bookings`, { 
          state: { 
            message: 'Ride booked successfully!',
            bookingId: response.data.data._id
          }
        });
      } else {
        setError(response.data.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      if (err.response?.status === 401) {
        navigate('/login', { 
          state: { 
            from: `/rides/book/${serviceId}`,
            message: 'Your session has expired. Please login again.'
          }
        });
      } else {
        setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Get service icon based on type
  const getServiceIcon = (type) => {
    switch (type) {
      case 'cab':
        return <TaxiIcon fontSize="large" />;
      case 'shuttle':
        return <ShuttleIcon fontSize="large" />;
      case 'e-rickshaw':
        return <RickshawIcon fontSize="large" />;
      case 'auto':
        return <AutoIcon fontSize="large" />;
      default:
        return <TaxiIcon fontSize="large" />;
    }
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
  
  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/rides')}
          sx={{ mt: 2 }}
        >
          Back to Ride Services
        </Button>
      </Container>
    );
  }
  
  const steps = ['Select Locations', 'Schedule & Preferences', 'Review & Pay'];
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Book a Ride
        </Typography>
        
        {rideService && (
          <Paper elevation={1} sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              width: 60,
              height: 60,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 1,
              mr: 2
            }}>
              {getServiceIcon(rideService.type)}
            </Box>
            <Box>
              <Typography variant="h6">{rideService.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {rideService.description || `${rideService.type} ride service`}
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip 
                  label={`Max ${rideService.maxPassengers || 4} passengers`} 
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip 
                  label={rideService.type.charAt(0).toUpperCase() + rideService.type.slice(1)} 
                  color="secondary"
                  size="small"
                />
              </Box>
            </Box>
          </Paper>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={handleSubmit}>
          {activeStep === 0 && (
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Pickup & Dropoff Locations</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pickup Address"
                    name="pickupAddress"
                    value={formData.pickupLocation.address}
                    onChange={(e) => handleLocationChange('pickupLocation', 'address', e.target.value)}
                    required
                    variant="outlined"
                    placeholder="Enter pickup address"
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Dropoff Address"
                    name="dropoffAddress"
                    value={formData.dropoffLocation.address}
                    onChange={(e) => handleLocationChange('dropoffLocation', 'address', e.target.value)}
                    required
                    variant="outlined"
                    placeholder="Enter dropoff address"
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Approximate Distance (km)"
                    name="distance"
                    type="number"
                    value={formData.distance}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    inputProps={{ min: 1, step: 0.1 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Estimated Duration (minutes)"
                    name="estimatedDuration"
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    inputProps={{ min: 5, step: 1 }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          )}
          
          {activeStep === 1 && (
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Schedule & Preferences</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pickup Date"
                    name="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: <CalendarIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Pickup Time"
                    name="scheduledTime"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: <TimeIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Number of Passengers"
                    name="passengers"
                    type="number"
                    value={formData.passengers}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    inputProps={{ 
                      min: 1, 
                      max: rideService ? (rideService.maxPassengers || 4) : 4,
                      step: 1 
                    }}
                    InputProps={{
                      startAdornment: <PeopleIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      name="paymentMethod"
                      label="Payment Method"
                      required
                    >
                      <MenuItem value="credit">Credit Card</MenuItem>
                      <MenuItem value="debit">Debit Card</MenuItem>
                      <MenuItem value="upi">UPI</MenuItem>
                      <MenuItem value="wallet">Wallet</MenuItem>
                      <MenuItem value="cash">Cash</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Box>
            </Paper>
          )}
          
          {activeStep === 2 && (
            <Paper elevation={1} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Review & Confirm</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Ride Details</Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Pickup</Typography>
                        <Typography variant="body2">{formData.pickupLocation.address}</Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Dropoff</Typography>
                        <Typography variant="body2">{formData.dropoffLocation.address}</Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Scheduled For</Typography>
                        <Typography variant="body2">
                          {formData.scheduledDate} at {formData.scheduledTime}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Distance & Duration</Typography>
                        <Typography variant="body2">{formData.distance} km, approximately {formData.estimatedDuration} mins</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2">Passengers</Typography>
                        <Typography variant="body2">{formData.passengers} {formData.passengers === 1 ? 'person' : 'people'}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Fare Breakdown</Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Base fare:</Typography>
                        <Typography variant="body2">₹{fareDetails.baseFare.toFixed(2)}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Distance charge ({formData.distance} km):</Typography>
                        <Typography variant="body2">₹{fareDetails.distanceFare.toFixed(2)}</Typography>
                      </Box>
                      
                      {fareDetails.timeFare > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Time charge ({formData.estimatedDuration} mins):</Typography>
                          <Typography variant="body2">₹{fareDetails.timeFare.toFixed(2)}</Typography>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">₹{(fareDetails.baseFare + fareDetails.distanceFare + fareDetails.timeFare).toFixed(2)}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Tax (18%):</Typography>
                        <Typography variant="body2">₹{fareDetails.tax.toFixed(2)}</Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">Total fare:</Typography>
                        <Typography variant="subtitle1" fontWeight="bold">₹{fareDetails.totalFare.toFixed(2)}</Typography>
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          Payment method: {formData.paymentMethod.charAt(0).toUpperCase() + formData.paymentMethod.slice(1)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Confirm Booking'}
                </Button>
              </Box>
            </Paper>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default RideBooking; 