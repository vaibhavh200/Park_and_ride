import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Container,
  IconButton,
  Divider,
  Paper
} from '@mui/material';
import { 
  LocalTaxi as TaxiIcon,
  AirportShuttle as ShuttleIcon,
  ElectricRickshaw as RickshawIcon,
  DirectionsCar as AutoIcon,
  FilterList as FilterIcon,
  Wifi as WifiIcon,
  AcUnit as AcIcon,
  Accessible as AccessibleIcon,
  ChildCare as ChildSeatIcon,
  Pets as PetIcon,
  Work as LuggageIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const RideServices = () => {
  const [rideServices, setRideServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const { stationId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRideServices = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = '/api/rides/services';
        
        // If there's a station ID, get services for that station
        if (stationId) {
          endpoint = `/api/rides/services/station/${stationId}`;
        }
        
        const response = await axios.get(endpoint);
        
        if (response.data.success) {
          setRideServices(response.data.data);
        } else {
          setError(response.data.message || 'Failed to fetch ride services');
        }
      } catch (err) {
        console.error('Error fetching ride services:', err);
        setError('An error occurred while fetching ride services. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRideServices();
  }, [stationId]);
  
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };
  
  const handleBookRide = (serviceId) => {
    // Navigate to the ride booking page with the selected service
    navigate(`/rides/book/${serviceId}`);
  };
  
  // Filter services based on selected type
  const filteredServices = filter === 'all' 
    ? rideServices 
    : rideServices.filter(service => service.type === filter);
  
  // Function to render the appropriate icon based on service type
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
  
  // Function to render feature icons
  const renderFeatureIcons = (features) => {
    return features.map(feature => {
      let icon;
      let label;
      
      switch (feature) {
        case 'ac':
          icon = <AcIcon fontSize="small" />;
          label = 'AC';
          break;
        case 'wifi':
          icon = <WifiIcon fontSize="small" />;
          label = 'WiFi';
          break;
        case 'wheelchair-access':
          icon = <AccessibleIcon fontSize="small" />;
          label = 'Accessible';
          break;
        case 'child-seat':
          icon = <ChildSeatIcon fontSize="small" />;
          label = 'Child Seat';
          break;
        case 'pet-friendly':
          icon = <PetIcon fontSize="small" />;
          label = 'Pet Friendly';
          break;
        case 'luggage-space':
          icon = <LuggageIcon fontSize="small" />;
          label = 'Luggage Space';
          break;
        default:
          return null;
      }
      
      return (
        <Chip
          key={feature}
          icon={icon}
          label={label}
          size="small"
          variant="outlined"
          sx={{ mr: 0.5, mb: 0.5 }}
        />
      );
    });
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
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Last Mile Connectivity
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Choose from various options to complete your journey from the metro station to your final destination.
        </Typography>
        
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Available Services</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterIcon sx={{ mr: 1 }} />
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={filter}
                  onChange={handleFilterChange}
                  label="Service Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="cab">Cabs</MenuItem>
                  <MenuItem value="shuttle">Shuttles</MenuItem>
                  <MenuItem value="e-rickshaw">E-Rickshaws</MenuItem>
                  <MenuItem value="auto">Auto Rickshaws</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          {filteredServices.length === 0 ? (
            <Alert severity="info">No ride services available for the selected criteria.</Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredServices.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service._id}>
                  <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="div"
                      sx={{
                        height: 140,
                        bgcolor: 'primary.light',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white'
                      }}
                    >
                      {getServiceIcon(service.type)}
                    </CardMedia>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="h2">
                          {service.name}
                        </Typography>
                        <Chip 
                          label={service.isShared ? 'Shared' : 'Private'} 
                          color={service.isShared ? 'secondary' : 'primary'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {service.description}
                      </Typography>
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2">
                          <strong>Base Rate:</strong> ₹{service.baseRate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Per Km Rate:</strong> ₹{service.perKmRate}
                        </Typography>
                        {service.perMinuteRate > 0 && (
                          <Typography variant="body2">
                            <strong>Per Minute Rate:</strong> ₹{service.perMinuteRate}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          <strong>Wait Time:</strong> ~{service.estimatedWaitTime} mins
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Max Passengers:</strong> {service.maxPassengers}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Vehicles:</strong> {service.vehicleTypes.join(', ')}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ my: 1 }}>
                        {renderFeatureIcons(service.features)}
                      </Box>
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        fullWidth
                        onClick={() => handleBookRide(service._id)}
                      >
                        Book Now
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default RideServices; 