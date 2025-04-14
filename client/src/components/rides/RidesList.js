import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Container,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Divider,
  Chip,
  Rating,
  Tab,
  Tabs,
  InputAdornment,
  Avatar,
  CircularProgress
} from '@mui/material';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import ElectricRickshawIcon from '@mui/icons-material/ElectricRickshaw';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PaymentsIcon from '@mui/icons-material/Payments';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ride-tabpanel-${index}`}
      aria-labelledby={`ride-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const RidesList = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchParams, setSearchParams] = useState({
    pickup: '',
    dropoff: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    passengers: 1
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rideServices, setRideServices] = useState({
    cabs: [],
    shuttles: [],
    rickshaws: []
  });
  const [error, setError] = useState(null);

  // Mock ride data with valid MongoDB ObjectIds (24 character hex strings)
  const taxis = [
    {
      id: "507f1f77bcf86cd799439011", // Valid MongoDB ObjectId format instead of numeric ID
      mongoId: "507f1f77bcf86cd799439011", // Valid MongoDB ObjectId format
      type: "Compact",
      provider: "QuickRide",
      driverName: "Rahul S.",
      driverRating: 4.8,
      price: 149,
      estimatedTime: "10 min",
      availableSeats: 4,
      image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop"
    },
    {
      id: "507f1f77bcf86cd799439012", // Valid MongoDB ObjectId format instead of numeric ID
      mongoId: "507f1f77bcf86cd799439012", // Valid MongoDB ObjectId format
      type: "Sedan",
      provider: "CityRides",
      driverName: "Priya M.",
      driverRating: 4.6,
      price: 199,
      estimatedTime: "12 min",
      availableSeats: 4,
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=500&auto=format&fit=crop"
    },
    {
      id: "507f1f77bcf86cd799439013", // Valid MongoDB ObjectId format instead of numeric ID
      mongoId: "507f1f77bcf86cd799439013", // Valid MongoDB ObjectId format
      type: "SUV",
      provider: "Metro Connect",
      driverName: "Amit K.",
      driverRating: 4.9,
      price: 249,
      estimatedTime: "8 min",
      availableSeats: 6,
      image: "https://images.unsplash.com/photo-1546614042-7df3c24c9e5d?w=500&auto=format&fit=crop"
    }
  ];

  const shuttles = [
    {
      id: "507f1f77bcf86cd799439014", // Valid MongoDB ObjectId format
      mongoId: "507f1f77bcf86cd799439014", // Valid MongoDB ObjectId format
      type: "Shuttle",
      route: "Central Metro - Tech Park",
      provider: "MetroShuttle",
      nextDeparture: "10:15 AM",
      price: 50,
      stops: 3,
      availableSeats: 12,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop"
    },
    {
      id: "507f1f77bcf86cd799439015", // Valid MongoDB ObjectId format
      mongoId: "507f1f77bcf86cd799439015", // Valid MongoDB ObjectId format
      type: "Shuttle",
      route: "Central Metro - Business District",
      provider: "CityConnect",
      nextDeparture: "10:30 AM",
      price: 60,
      stops: 5,
      availableSeats: 8,
      image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=500&auto=format&fit=crop"
    },
    {
      id: "507f1f77bcf86cd799439016", // Valid MongoDB ObjectId format
      mongoId: "507f1f77bcf86cd799439016", // Valid MongoDB ObjectId format
      type: "Shuttle",
      route: "Central Metro - Residential Zone",
      provider: "EasyCommute",
      nextDeparture: "10:45 AM",
      price: 40,
      stops: 7,
      availableSeats: 15,
      image: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=500&auto=format&fit=crop"
    }
  ];

  const rickshaws = [
    {
      id: "507f1f77bcf86cd799439017", // Valid MongoDB ObjectId format
      mongoId: "507f1f77bcf86cd799439017", // Valid MongoDB ObjectId format
      type: "E-Rickshaw",
      driverName: "Vikram P.",
      driverRating: 4.5,
      price: 60,
      estimatedTime: "5 min",
      availableSeats: 3,
      image: "https://images.unsplash.com/photo-1579868185547-8e66b2b91f5d?w=500&auto=format&fit=crop"
    },
    {
      id: "507f1f77bcf86cd799439018", // Valid MongoDB ObjectId format
      mongoId: "507f1f77bcf86cd799439018", // Valid MongoDB ObjectId format
      type: "E-Rickshaw",
      driverName: "Suresh T.",
      driverRating: 4.3,
      price: 50,
      estimatedTime: "7 min",
      availableSeats: 3,
      image: "https://images.unsplash.com/photo-1588697362969-d2544be835fc?w=500&auto=format&fit=crop"
    }
  ];

  // Fetch ride services from the backend
  useEffect(() => {
    const fetchRideServices = async () => {
      try {
        setLoading(true);
        
        // Fetch ride services from the API
        const response = await axios.get('/api/rides/services');
        if (response.data.success) {
          // Group services by type
          const services = response.data.data || [];
          setRideServices({
            cabs: services.filter(service => service.type === 'cab').map(service => ({
              id: service._id,
              mongoId: service._id,
              type: service.name,
              provider: service.provider.name,
              driverName: 'Available Driver',
              driverRating: 4.5,
              price: service.baseFare,
              estimatedTime: `${service.maxWaitingTime || 10} min`,
              availableSeats: service.maxPassengers,
              image: service.image || "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=500&auto=format&fit=crop"
            })),
            shuttles: services.filter(service => service.type === 'shuttle').map(service => ({
              id: service._id,
              mongoId: service._id,
              type: "Shuttle",
              route: service.name,
              provider: service.provider.name,
              nextDeparture: "10:15 AM",
              price: service.baseFare,
              stops: 3,
              availableSeats: service.maxPassengers,
              image: service.image || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop"
            })),
            rickshaws: services.filter(service => service.type === 'e-rickshaw').map(service => ({
              id: service._id,
              mongoId: service._id,
              type: "E-Rickshaw",
              driverName: "Available Driver",
              driverRating: 4.5,
              price: service.baseFare,
              estimatedTime: `${service.maxWaitingTime || 5} min`,
              availableSeats: service.maxPassengers,
              image: service.image || "https://images.unsplash.com/photo-1579868185547-8e66b2b91f5d?w=500&auto=format&fit=crop"
            }))
          });
        } else {
          // Use mock data as fallback
          console.warn('API did not return success. Using mock data instead.');
          setRideServices({
            cabs: taxis,
            shuttles,
            rickshaws
          });
        }
      } catch (error) {
        console.error('Error fetching ride services:', error);
        toast.error('Failed to load ride services. Using mock data instead.');
        
        // Use mock data as fallback
        setRideServices({
          cabs: taxis,
          shuttles,
          rickshaws
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRideServices();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    // In a real app, this would trigger an API call to find rides
    console.log("Searching with params:", searchParams);
    toast.success("Search complete! Choose a ride option below.");
  };

  // Calculate distance between two points (haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2-lat1);
    const dLon = deg2rad(lon2-lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  // Calculate fare based on distance and ride type
  const calculateFare = (distance, rideType, basePrice, pricePerKm) => {
    let fare = basePrice + (distance * pricePerKm);
    
    // Round to nearest 10
    return Math.ceil(fare / 10) * 10;
  };
  
  // Get coordinates from addresses (in a real app, this would use geocoding API)
  const getCoordinates = (address) => {
    // Mock coordinates for demo purposes
    const coordinates = {
      "Central Metro Station": { lat: 28.6139, lng: 77.2090 },
      "Tech Park": { lat: 28.5620, lng: 77.3000 },
      "Business District": { lat: 28.5300, lng: 77.2200 },
      "Residential Zone": { lat: 28.6500, lng: 77.2800 },
      "Nearby Market": { lat: 28.6100, lng: 77.2500 }
    };
    
    // Default to Central Metro if address not found
    return coordinates[address] || { lat: 28.6139, lng: 77.2090 };
  };

  const handleBookRide = async (rideId) => {
    try {
      const selectedRide = rideServices.cabs.find(ride => ride.id === rideId);
      
      if (!selectedRide) {
        toast.error('Selected ride not found');
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in to book a ride');
        navigate('/login', { 
          state: { 
            from: '/rides', 
            message: 'Please login to book a ride' 
          } 
        });
        return;
      }
      
      console.log('Booking ride with ID:', selectedRide.mongoId);
      
      // Navigate to the booking page with ride details
      navigate(`/rides/book/${selectedRide.mongoId}`, { 
        state: { 
          searchParams: {
            ...searchParams,
            rideType: 'cab',
            rideId: selectedRide.mongoId
          } 
        } 
      });
    } catch (error) {
      console.error('Error booking ride:', error);
      toast.error('Failed to book ride. Please try again.');
    }
  };
  
  const handleBookShuttle = async (shuttleId) => {
    try {
      const selectedShuttle = rideServices.shuttles.find(shuttle => shuttle.id === shuttleId);
      
      if (!selectedShuttle) {
        toast.error('Selected shuttle not found');
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in to book a shuttle');
        navigate('/login', { 
          state: { 
            from: '/rides', 
            message: 'Please login to book a shuttle' 
          } 
        });
        return;
      }
      
      // Navigate to the booking page with shuttle details
      navigate(`/rides/book/${selectedShuttle.mongoId}`, { 
        state: { 
          searchParams: {
            ...searchParams,
            rideType: 'shuttle',
            rideId: selectedShuttle.mongoId
          } 
        } 
      });
    } catch (error) {
      console.error('Error booking shuttle:', error);
      toast.error('Failed to book shuttle. Please try again.');
    }
  };
  
  const handleBookRickshaw = async (rickshawId) => {
    try {
      const selectedRickshaw = rideServices.rickshaws.find(rickshaw => rickshaw.id === rickshawId);
      
      if (!selectedRickshaw) {
        toast.error('Selected e-rickshaw not found');
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Please log in to book an e-rickshaw');
        navigate('/login', { 
          state: { 
            from: '/rides', 
            message: 'Please login to book an e-rickshaw' 
          } 
        });
        return;
      }
      
      // Navigate to the booking page with rickshaw details
      navigate(`/rides/book/${selectedRickshaw.mongoId}`, { 
        state: { 
          searchParams: {
            ...searchParams,
            rideType: 'e-rickshaw',
            rideId: selectedRickshaw.mongoId
          } 
        } 
      });
    } catch (error) {
      console.error('Error booking e-rickshaw:', error);
      toast.error('Failed to book e-rickshaw. Please try again.');
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Search Section */}
      <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocalTaxiIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4">Book a Ride</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Pickup Location"
              name="pickup"
              value={searchParams.pickup}
              onChange={handleChange}
              variant="outlined"
              placeholder="Enter metro station or address"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Drop-off Location"
              name="dropoff"
              value={searchParams.dropoff}
              onChange={handleChange}
              variant="outlined"
              placeholder="Enter destination"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={searchParams.date}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Time"
              name="time"
              type="time"
              value={searchParams.time}
              onChange={handleChange}
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Passengers</InputLabel>
              <Select
                name="passengers"
                value={searchParams.passengers}
                onChange={handleChange}
                label="Passengers"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num}>{num} {num === 1 ? 'passenger' : 'passengers'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
            sx={{ px: 4 }}
          >
            Find Rides
          </Button>
        </Box>
      </Paper>
      
      {/* Ride Options Tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="ride options tabs"
            centered
          >
            <Tab icon={<LocalTaxiIcon />} label="Cabs" />
            <Tab icon={<AirportShuttleIcon />} label="Shuttles" />
            <Tab icon={<ElectricRickshawIcon />} label="E-Rickshaws" />
          </Tabs>
        </Box>
        
        {/* Cabs Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Available Cabs
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {rideServices.cabs.map((taxi) => (
                <Grid item xs={12} sm={6} md={4} key={taxi.id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={taxi.image}
                      alt={taxi.type}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div">
                        {taxi.type} - {taxi.provider}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Driver: {taxi.driverName}
                        </Typography>
                        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                          <StarIcon sx={{ color: 'gold', fontSize: 16 }} />
                          <Typography variant="body2" color="text.secondary">
                            {taxi.driverRating}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Arrives in: {taxi.estimatedTime}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Typography variant="h6" color="primary">
                          ₹{taxi.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {taxi.availableSeats} seats
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        onClick={() => handleBookRide(taxi.id)}
                      >
                        Book Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        {/* Shuttles Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Shuttle Services
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {rideServices.shuttles.map((shuttle) => (
                <Grid item xs={12} md={4} key={shuttle.id}>
                  <Card elevation={2}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={shuttle.image}
                      alt={shuttle.route}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {shuttle.route}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DirectionsTransitIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {shuttle.provider}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Next Departure
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {shuttle.nextDeparture}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Available Seats
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {shuttle.availableSeats}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Route Stops
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {shuttle.stops} stops
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Fare
                          </Typography>
                          <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                            ₹{shuttle.price}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                    <CardActions>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleBookShuttle(shuttle.id)}
                      >
                        Reserve Seat
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        {/* E-Rickshaws Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h5" gutterBottom>
            E-Rickshaws
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {rideServices.rickshaws.map((rickshaw) => (
                <Grid item xs={12} sm={6} key={rickshaw.id}>
                  <Card elevation={2} sx={{ display: 'flex', height: '100%' }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 150 }}
                      image={rickshaw.image}
                      alt="E-Rickshaw"
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <CardContent sx={{ flex: '1 0 auto' }}>
                        <Typography variant="h6" gutterBottom>
                          {rickshaw.type}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2">
                            {rickshaw.driverName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                            <StarIcon sx={{ color: 'gold', fontSize: 16 }} />
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                              {rickshaw.driverRating}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Arrives in
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {rickshaw.estimatedTime}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Fare
                            </Typography>
                            <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                              ₹{rickshaw.price}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="small"
                          onClick={() => handleBookRickshaw(rickshaw.id)}
                        >
                          Book Now
                        </Button>
                      </CardActions>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Box>
    </Container>
  );
};

export default RidesList; 