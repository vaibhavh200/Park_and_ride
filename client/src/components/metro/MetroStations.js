import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Divider,
  Chip,
  IconButton,
  Link
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DirectionsIcon from '@mui/icons-material/Directions';
import InfoIcon from '@mui/icons-material/Info';
import { Link as RouterLink } from 'react-router-dom';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`station-tabpanel-${index}`}
      aria-labelledby={`station-tab-${index}`}
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

const MetroStations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [favorites, setFavorites] = useState([2, 5]); // IDs of favorite stations

  // Mock metro station data
  const metroStations = [
    {
      id: 1,
      name: "Central Metro",
      area: "Downtown",
      lines: ["Red", "Blue"],
      parkingAvailable: true,
      parkingSpots: 120,
      lastMileOptions: ["Taxi", "E-Rickshaw", "Bus"],
      coordinates: { lat: 28.6139, lng: 77.2090 },
      image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=500&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "East Metro",
      area: "Eastview",
      lines: ["Blue", "Green"],
      parkingAvailable: true,
      parkingSpots: 80,
      lastMileOptions: ["Taxi", "E-Rickshaw"],
      coordinates: { lat: 28.6269, lng: 77.2373 },
      image: "https://images.unsplash.com/photo-1547407139-3c921a66005c?w=500&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "West Metro",
      area: "Westhill",
      lines: ["Yellow", "Purple"],
      parkingAvailable: true,
      parkingSpots: 95,
      lastMileOptions: ["Taxi", "Bus", "Shuttle"],
      coordinates: { lat: 28.5629, lng: 77.1640 },
      image: "https://images.unsplash.com/photo-1564689510742-4e9c7584181d?w=500&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "North Metro",
      area: "Northgate",
      lines: ["Red"],
      parkingAvailable: true,
      parkingSpots: 60,
      lastMileOptions: ["Taxi", "E-Rickshaw", "Shuttle"],
      coordinates: { lat: 28.7158, lng: 77.1563 },
      image: "https://images.unsplash.com/photo-1601240333928-83bbbb77103f?w=500&auto=format&fit=crop"
    },
    {
      id: 5,
      name: "South Metro",
      area: "Southview",
      lines: ["Green", "Yellow"],
      parkingAvailable: true,
      parkingSpots: 110,
      lastMileOptions: ["Taxi", "Bus"],
      coordinates: { lat: 28.5293, lng: 77.2088 },
      image: "https://images.unsplash.com/photo-1600768706972-cca4a831a0bb?w=500&auto=format&fit=crop"
    },
    {
      id: 6,
      name: "Tech Park Metro",
      area: "Tech District",
      lines: ["Purple"],
      parkingAvailable: false,
      parkingSpots: 0,
      lastMileOptions: ["Taxi", "Shuttle"],
      coordinates: { lat: 28.5529, lng: 77.2588 },
      image: "https://images.unsplash.com/photo-1504278052032-34fe0095d263?w=500&auto=format&fit=crop"
    }
  ];

  // Mock schedule data for selected station
  const scheduleData = [
    { id: 1, destination: "Central Metro", line: "Red", departureTime: "10:00 AM", platform: 1, status: "On Time" },
    { id: 2, destination: "East Metro", line: "Blue", departureTime: "10:15 AM", platform: 2, status: "On Time" },
    { id: 3, destination: "North Metro", line: "Red", departureTime: "10:25 AM", platform: 1, status: "Delayed 5m" },
    { id: 4, destination: "West Metro", line: "Yellow", departureTime: "10:30 AM", platform: 3, status: "On Time" },
    { id: 5, destination: "South Metro", line: "Green", departureTime: "10:40 AM", platform: 2, status: "On Time" },
    { id: 6, destination: "Tech Park Metro", line: "Purple", departureTime: "10:50 AM", platform: 4, status: "On Time" }
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setTabValue(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const toggleFavorite = (stationId) => {
    if (favorites.includes(stationId)) {
      setFavorites(favorites.filter(id => id !== stationId));
    } else {
      setFavorites([...favorites, stationId]);
    }
  };

  const filteredStations = metroStations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLineColor = (line) => {
    switch(line) {
      case 'Red': return '#E53935';
      case 'Blue': return '#1976D2';
      case 'Green': return '#43A047';
      case 'Yellow': return '#FDD835';
      case 'Purple': return '#8E24AA';
      default: return '#757575';
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 3, mt: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <DirectionsTransitIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4">Metro Stations</Typography>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search stations by name or area"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Paper>
      
      {/* Selected Station Details */}
      {selectedStation && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <img 
                src={selectedStation.image} 
                alt={selectedStation.name}
                style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" gutterBottom>{selectedStation.name}</Typography>
                <IconButton 
                  onClick={() => toggleFavorite(selectedStation.id)}
                  color="secondary"
                >
                  {favorites.includes(selectedStation.id) ? 
                    <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
              </Box>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {selectedStation.area}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedStation.lines.map((line) => (
                  <Chip 
                    key={line}
                    label={line} 
                    size="small"
                    sx={{ 
                      bgcolor: getLineColor(line),
                      color: ['Yellow'].includes(line) ? 'rgba(0,0,0,0.7)' : 'white'
                    }}
                  />
                ))}
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalParkingIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      {selectedStation.parkingAvailable ? 
                        `${selectedStation.parkingSpots} parking spots` : 
                        'No parking available'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalTaxiIcon color="primary" sx={{ mr: 1 }} />
                    <Typography>
                      {selectedStation.lastMileOptions.join(', ')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {selectedStation.parkingAvailable && (
                  <Button 
                    variant="contained" 
                    component={RouterLink}
                    to="/parking"
                    startIcon={<LocalParkingIcon />}
                  >
                    Book Parking
                  </Button>
                )}
                <Button 
                  variant="outlined"
                  component={RouterLink}
                  to="/rides" 
                  startIcon={<LocalTaxiIcon />}
                >
                  Book Ride
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<DirectionsIcon />}
                >
                  Get Directions
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ width: '100%', mt: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="station details tabs"
              >
                <Tab label="Schedules" />
                <Tab label="Facilities" />
                <Tab label="Map" />
              </Tabs>
            </Box>
            
            {/* Schedules Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Upcoming Departures
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Line</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>Departure</TableCell>
                      <TableCell>Platform</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scheduleData.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <Chip 
                            label={schedule.line} 
                            size="small"
                            sx={{ 
                              bgcolor: getLineColor(schedule.line),
                              color: schedule.line === 'Yellow' ? 'rgba(0,0,0,0.7)' : 'white'
                            }}
                          />
                        </TableCell>
                        <TableCell>{schedule.destination}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 1 }} />
                            {schedule.departureTime}
                          </Box>
                        </TableCell>
                        <TableCell>{schedule.platform}</TableCell>
                        <TableCell>
                          <Chip 
                            label={schedule.status} 
                            color={schedule.status === "On Time" ? "success" : "warning"}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            
            {/* Facilities Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Station Facilities
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Amenities
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        <Box component="li"><Typography>Ticket Counters</Typography></Box>
                        <Box component="li"><Typography>Restrooms</Typography></Box>
                        <Box component="li"><Typography>Waiting Area</Typography></Box>
                        <Box component="li"><Typography>WiFi</Typography></Box>
                        <Box component="li"><Typography>ATM</Typography></Box>
                        {selectedStation.parkingAvailable && (
                          <Box component="li"><Typography>Parking ({selectedStation.parkingSpots} spots)</Typography></Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Last Mile Connectivity
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        {selectedStation.lastMileOptions.map((option, index) => (
                          <Box key={index} component="li">
                            <Typography>{option}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Accessibility
                      </Typography>
                      <Box component="ul" sx={{ pl: 2 }}>
                        <Box component="li"><Typography>Elevators</Typography></Box>
                        <Box component="li"><Typography>Wheelchair Ramps</Typography></Box>
                        <Box component="li"><Typography>Tactile Paths</Typography></Box>
                        <Box component="li"><Typography>Assistance Available</Typography></Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Map Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Station Map
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  height: 400,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#f0f0f0',
                  position: 'relative',
                }}
              >
                <Typography>
                  Interactive map would be displayed here, showing the location of {selectedStation.name} station.
                </Typography>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    bgcolor: 'background.paper', 
                    p: 1, 
                    borderRadius: 1, 
                    boxShadow: 1 
                  }}
                >
                  <Typography variant="body2">
                    Coordinates: {selectedStation.coordinates.lat}, {selectedStation.coordinates.lng}
                  </Typography>
                </Box>
              </Paper>
            </TabPanel>
          </Box>
        </Paper>
      )}
      
      {/* Stations List */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        {searchQuery ? 'Search Results' : 'All Metro Stations'}
      </Typography>
      
      <Grid container spacing={3}>
        {filteredStations.map((station) => (
          <Grid item xs={12} sm={6} md={4} key={station.id}>
            <Card elevation={2}>
              <Box sx={{ position: 'relative' }}>
                <img 
                  src={station.image} 
                  alt={station.name}
                  style={{ width: '100%', height: 140, objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                  }}
                >
                  <IconButton 
                    onClick={() => toggleFavorite(station.id)}
                    sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                    size="small"
                    color="secondary"
                  >
                    {favorites.includes(station.id) ? 
                      <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
              </Box>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {station.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {station.area}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 1 }}>
                  {station.lines.map((line) => (
                    <Chip 
                      key={line}
                      label={line} 
                      size="small"
                      sx={{ 
                        bgcolor: getLineColor(line),
                        color: ['Yellow'].includes(line) ? 'rgba(0,0,0,0.7)' : 'white'
                      }}
                    />
                  ))}
                </Box>
                
                <Divider sx={{ my: 1.5 }} />
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalParkingIcon color={station.parkingAvailable ? "primary" : "disabled"} fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color={station.parkingAvailable ? "text.primary" : "text.disabled"}>
                        {station.parkingAvailable ? `${station.parkingSpots} spots` : 'No parking'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocalTaxiIcon color="primary" fontSize="small" sx={{ mr: 0.5 }} />
                      <Typography variant="body2">
                        {station.lastMileOptions.length} options
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions>
                <Button 
                  fullWidth 
                  variant="contained" 
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => handleStationSelect(station)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MetroStations; 