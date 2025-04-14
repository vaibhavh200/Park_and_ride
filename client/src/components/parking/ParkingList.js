import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SecurityIcon from '@mui/icons-material/Security';
import WifiIcon from '@mui/icons-material/Wifi';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';

const ParkingList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 2
  });
  const [parkingSpots, setParkingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add state for smart parking assignment
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [recommendedSpot, setRecommendedSpot] = useState(null);
  const [showSmartAssignment, setShowSmartAssignment] = useState(false);

  // Fetch parking spots when component mounts
  useEffect(() => {
    const fetchParkingSpots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/parking/spots');
        
        if (response.data.success) {
          setParkingSpots(response.data.data);
        } else {
          setError('Failed to load parking spots');
        }
      } catch (err) {
        console.error('Error fetching parking spots:', err);
        setError('Failed to load parking spots. Please try again later.');
        
        // Fallback to mock data if API fails
        setParkingSpots([
          {
            _id: "1",
            name: "Central Metro Parking",
            location: {
              address: {
                street: "Central Metro Road",
                city: "Delhi"
              }
            },
            distance: 0.2,
            hourlyRate: 25,
            ratings: {
              average: 4.5
            },
            availableSpots: 12,
            amenities: ["security-guard", "cctv", "electric-charging", "disabled-access"],
            images: ["https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=500&auto=format&fit=crop"]
          },
          {
            _id: "2",
            name: "East Metro Parking",
            location: {
              address: {
                street: "East Metro Road",
                city: "Delhi"
              }
            },
            distance: 0.5,
            hourlyRate: 20,
            ratings: {
              average: 4.0
            },
            availableSpots: 5,
            amenities: ["cctv", "car-wash"],
            images: ["https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=500&auto=format&fit=crop"]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSpots();
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Unable to get your current location. Smart parking assignment may not be accurate.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser. Smart parking assignment may not be accurate.");
    }
  }, []);

  // Find recommended parking spot based on user location and availability
  useEffect(() => {
    if (userLocation && parkingSpots.length > 0) {
      // Calculate distances to each parking spot
      const spotsWithDistance = parkingSpots.map(spot => {
        // Use either the actual coordinates from database or the mock distance property
        const distance = spot.distance || calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          spot.location?.coordinates?.[1] || 28.6139, 
          spot.location?.coordinates?.[0] || 77.2090
        );
        
        return {
          ...spot,
          calculatedDistance: distance
        };
      });
      
      // Find spot with:
      // 1. Highest availability (to avoid congestion)
      // 2. Closest distance
      // 3. Lowest hourly rate as tie-breaker
      const sortedSpots = spotsWithDistance.sort((a, b) => {
        // First prioritize spots with higher availability
        if (a.availableSpots !== b.availableSpots) {
          return b.availableSpots - a.availableSpots;
        }
        
        // Then prioritize by distance
        if (a.calculatedDistance !== b.calculatedDistance) {
          return a.calculatedDistance - b.calculatedDistance;
        }
        
        // Finally, compare prices
        return a.hourlyRate - b.hourlyRate;
      });
      
      if (sortedSpots.length > 0) {
        setRecommendedSpot(sortedSpots[0]);
      }
    }
  }, [userLocation, parkingSpots]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  // Convert degrees to radians
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchParams.location) params.append('location', searchParams.location);
      
      // Use the available endpoint to filter by date and time
      if (searchParams.date && searchParams.time) {
        const duration = parseInt(searchParams.duration);
        
        // Calculate end time based on start time and duration
        const [hours, minutes] = searchParams.time.split(':');
        const startTime = `${hours}:${minutes}`;
        
        const endHour = parseInt(hours) + duration;
        const endMinutes = minutes;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinutes}`;
        
        params.append('date', searchParams.date);
        params.append('startTime', startTime);
        params.append('endTime', endTime);
        
        // Use the available endpoint
        const response = await axios.get(`/api/parking/spots/available?${params.toString()}`);
        
        if (response.data.success) {
          setParkingSpots(response.data.data);
        } else {
          setError('Failed to find parking spots');
        }
      } else {
        // If no date/time provided, just get all spots
        const response = await axios.get(`/api/parking/spots?${params.toString()}`);
        
        if (response.data.success) {
          setParkingSpots(response.data.data);
        } else {
          setError('Failed to find parking spots');
        }
      }
    } catch (err) {
      console.error('Error searching parking spots:', err);
      setError('Failed to search. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderFacilityIcon = (facility) => {
    switch(facility) {
      case 'security-guard': return <SecurityIcon titleAccess="24/7 Security" />;
      case 'wifi': return <WifiIcon titleAccess="Free WiFi" />;
      case 'cctv': return <SecurityIcon titleAccess="CCTV Surveillance" />;
      case 'covered': return <DirectionsCarIcon titleAccess="Covered Parking" />;
      case 'disabled-access': return <AccessibleIcon titleAccess="Disabled Access" />;
      case 'electric-charging': return <ElectricCarIcon titleAccess="EV Charging" />;
      default: return null;
    }
  };

  // Navigate to parking detail page
  const handleBookNow = (id) => {
    navigate(`/parking/${id}`);
  };

  // Toggle smart assignment view
  const toggleSmartAssignment = () => {
    setShowSmartAssignment(!showSmartAssignment);
  };

  return (
    <Container maxWidth="lg">
      {/* Search Section */}
      <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocalParkingIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4">Find Parking</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={searchParams.location}
              onChange={handleChange}
              variant="outlined"
              placeholder="Enter metro station or area"
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
            <TextField
              fullWidth
              label="Duration (hours)"
              name="duration"
              type="number"
              value={searchParams.duration}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                inputProps: { min: 1, max: 24 }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button 
              fullWidth
              variant="contained" 
              color="primary" 
              onClick={handleSearch}
              sx={{ height: '56px' }}
              startIcon={<SearchIcon />}
            >
              Find Parking
            </Button>
          </Grid>
        </Grid>
        
        {/* Smart Parking Assignment Option */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            color="secondary"
            variant={showSmartAssignment ? "contained" : "outlined"}
            onClick={toggleSmartAssignment}
            startIcon={<DirectionsCarIcon />}
            sx={{ mt: 1 }}
          >
            {showSmartAssignment ? "Hide Smart Assignment" : "Smart Parking Assignment"}
          </Button>
          
          {locationError && (
            <Typography variant="body2" color="error">
              {locationError}
            </Typography>
          )}
        </Box>
      </Paper>
      
      {/* Smart Parking Assignment Card */}
      {showSmartAssignment && recommendedSpot && (
        <Paper elevation={4} sx={{ p: 3, mb: 4, borderLeft: '4px solid #1976d2' }}>
          <Typography variant="h5" gutterBottom>
            Recommended Spot For You
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <CardMedia
                component="img"
                height="160"
                image={recommendedSpot.images?.[0] || "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=500&auto=format&fit=crop"}
                alt={recommendedSpot.name}
                sx={{ borderRadius: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                {recommendedSpot.name}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {recommendedSpot.location?.address?.street}, {recommendedSpot.location?.address?.city}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DirectionsCarIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      <strong>{recommendedSpot.availableSpots}</strong> spots available
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {recommendedSpot.calculatedDistance?.toFixed(1) || recommendedSpot.distance?.toFixed(1) || "0.2"} km away
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoneyIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      ₹{recommendedSpot.hourlyRate}/hour
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {recommendedSpot.amenities?.map((amenity, index) => (
                  <Chip
                    key={index}
                    icon={renderFacilityIcon(amenity)}
                    label={amenity.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleBookNow(recommendedSpot._id)}
                sx={{ mt: 2 }}
                fullWidth
              >
                Book Recommended Spot
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Results Section */}
          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Available Parking Spots ({parkingSpots.length})
          </Typography>
          
          {parkingSpots.length === 0 && !loading && !error ? (
            <Alert severity="info">
              No parking spots found. Try different search criteria.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {parkingSpots.map((spot) => (
                <Grid item xs={12} md={4} key={spot._id}>
                  <Card elevation={2}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={spot.images && spot.images.length > 0 ? spot.images[0] : "https://via.placeholder.com/300x140?text=No+Image"}
                      alt={spot.name}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {spot.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {spot.location?.address?.street}, {spot.location?.address?.city}
                          {spot.distance && ` (${spot.distance} km)`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={spot.ratings?.average || 0} precision={0.5} size="small" readOnly />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({spot.ratings?.average || 0})
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${spot.availableSpots} spots left`} 
                          size="small" 
                          color={spot.availableSpots < 5 ? "warning" : "success"}
                        />
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Typography variant="h6" color="primary">
                          ₹{spot.hourlyRate}/hr
                        </Typography>
                        <Box>
                          {spot.amenities && spot.amenities.slice(0, 4).map((facility, idx) => (
                            <Box key={idx} component="span" sx={{ mx: 0.5, color: 'text.secondary' }}>
                              {renderFacilityIcon(facility)}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleBookNow(spot._id)}
                      >
                        Book Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default ParkingList; 