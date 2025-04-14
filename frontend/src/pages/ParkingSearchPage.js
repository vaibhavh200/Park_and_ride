import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Chip,
  Rating,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsIcon from '@mui/icons-material/Directions';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import AccessibleIcon from '@mui/icons-material/Accessible';

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

const ParkingSearchPage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = () => {
    // In a real app, this would call an API with the search criteria
    console.log('Search criteria:', { location, date, time, duration });
    setSearchPerformed(true);
  };
  
  const handleBooking = (parkingId) => {
    // Navigate to booking page with parking lot ID
    navigate(`/parking/book/${parkingId}`);
  };

  return (
    <Container maxWidth="lg">
      {/* Search Section */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Find Parking Near Metro Stations
        </Typography>
        
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Location or Metro Station"
              fullWidth
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Station"
              InputProps={{
                startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={2.25}>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={2.25}>
            <TextField
              label="Time"
              type="time"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={2.5}>
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                value={duration}
                label="Duration"
                onChange={(e) => setDuration(e.target.value)}
              >
                <MenuItem value="1">1 hour</MenuItem>
                <MenuItem value="2">2 hours</MenuItem>
                <MenuItem value="4">4 hours</MenuItem>
                <MenuItem value="8">8 hours</MenuItem>
                <MenuItem value="12">12 hours</MenuItem>
                <MenuItem value="24">All day</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Button 
              variant="contained" 
              size="large" 
              fullWidth
              onClick={handleSearch}
              startIcon={<LocalParkingIcon />}
            >
              Find Parking
            </Button>
          </Grid>
        </Grid>
        
        {/* Filter options */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <FilterListIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ mr: 2 }}>
            Filters:
          </Typography>
          <Chip label="EV Charging" size="small" sx={{ mr: 1 }} />
          <Chip label="Handicap Access" size="small" sx={{ mr: 1 }} />
          <Chip label="24/7 Operation" size="small" sx={{ mr: 1 }} />
          <Chip label="Price: Low to High" size="small" sx={{ mr: 1 }} />
        </Box>
      </Paper>
      
      {/* Results Section */}
      {searchPerformed && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {parkingLots.length} parking locations found
            </Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Sort by</InputLabel>
              <Select defaultValue="distance">
                <MenuItem value="distance">Distance</MenuItem>
                <MenuItem value="price">Price: Low to High</MenuItem>
                <MenuItem value="availability">Availability</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Grid container spacing={3}>
            {parkingLots.map((lot) => (
              <Grid item xs={12} md={6} key={lot.id}>
                <Card elevation={2}>
                  <Grid container>
                    <Grid item xs={12} md={4}>
                      <CardMedia
                        component="img"
                        height="100%"
                        image={lot.image}
                        alt={lot.name}
                        sx={{ height: '100%', minHeight: 200 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="div">
                            {lot.name}
                          </Typography>
                          <Chip 
                            label={`${lot.availableSpots} spots`} 
                            color={lot.availableSpots > 20 ? "success" : lot.availableSpots > 5 ? "warning" : "error"}
                            size="small" 
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {lot.address}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating value={lot.rating} precision={0.5} size="small" readOnly />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {lot.rating} ({Math.floor(Math.random() * 100) + 50} reviews)
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" gutterBottom>
                          <DirectionsIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {lot.distance} km from {lot.nearbyMetro}
                        </Typography>
                        
                        <Typography variant="body2" gutterBottom>
                          <AccessTimeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                          {lot.operatingHours}
                        </Typography>
                        
                        <Box sx={{ mt: 1 }}>
                          {lot.amenities.includes('EV Charging') && 
                            <Chip icon={<ElectricCarIcon />} label="EV Charging" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          }
                          {lot.amenities.includes('Handicap Access') && 
                            <Chip icon={<AccessibleIcon />} label="Handicap Access" size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          }
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Hourly rate
                            </Typography>
                            <Typography variant="h6" color="primary">
                              <AttachMoneyIcon fontSize="small" sx={{ verticalAlign: 'top' }} />
                              {lot.price.hourly}
                            </Typography>
                          </Box>
                          
                          <Button 
                            variant="contained" 
                            onClick={() => handleBooking(lot.id)}
                            sx={{ mt: 1 }}
                          >
                            Book Now
                          </Button>
                        </Box>
                      </CardContent>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Initial state - when no search has been performed */}
      {!searchPerformed && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <LocalParkingIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Start by searching for a parking location
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Enter your destination or a nearby metro station to find available parking spots.
            You can filter results by amenities, price, and more.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ParkingSearchPage; 