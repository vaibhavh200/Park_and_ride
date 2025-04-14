import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  TextField,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Paper,
  InputAdornment,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import PaymentIcon from '@mui/icons-material/Payment';
import PhoneIcon from '@mui/icons-material/Phone';
import SecurityIcon from '@mui/icons-material/Security';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';

// Sample data for popular locations
const popularLocations = [
  "Downtown Central",
  "Westfield Mall",
  "Central Train Station",
  "Airport Terminal 1",
  "Airport Terminal 2",
  "Business District",
  "Convention Center",
  "Stadium",
  "University Campus",
  "Medical Center"
];

const HomePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Here you would typically handle the search action
    console.log({ location, date, startTime, endTime });
    // Navigate to search results
    // history.push('/parking/search', { location, date, startTime, endTime });
  };
  
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(https://source.unsplash.com/1600x900/?parking,garage)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: { xs: 8, md: 15 },
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant={isSmall ? "h4" : "h2"} 
                component="h1" 
                fontWeight="bold"
                sx={{ mb: 2 }}
              >
                Find and Book Parking in Seconds
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Secure the best parking spots in advance. Save time and money with ParkNSync.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                component={Link}
                to="/parking/search"
                startIcon={<DirectionsCarIcon />}
                sx={{ 
                  mr: 2, 
                  mb: { xs: 2, sm: 0 },
                  py: 1.5,
                  px: 3
                }}
              >
                Find Parking Now
              </Button>
              <Button 
                variant="outlined" 
                color="inherit"
                size="large"
                sx={{ 
                  borderColor: 'white',
                  py: 1.5,
                  px: 3
                }}
              >
                How It Works
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper
                elevation={8}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  mt: { xs: 2, md: 0 }
                }}
              >
                <Typography variant="h5" component="h2" color="text.primary" gutterBottom fontWeight="bold">
                  Book Your Parking Spot
                </Typography>
                <form onSubmit={handleSearch}>
                  <Autocomplete
                    value={location}
                    onChange={(event, newValue) => {
                      setLocation(newValue);
                    }}
                    options={popularLocations}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Where are you going?"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <LocationOnIcon color="primary" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          )
                        }}
                      />
                    )}
                  />
                  
                  <TextField
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon color="primary" />
                        </InputAdornment>
                      )
                    }}
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Start Time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon color="primary" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="End Time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTimeIcon color="primary" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                    size="large"
                    startIcon={<SearchIcon />}
                    sx={{ mt: 3, py: 1.5 }}
                  >
                    Search Parking
                  </Button>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" component="h2" gutterBottom>
            Why Choose ParkNSync?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Our smart parking solution makes finding and booking parking spaces effortless
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {[
            {
              icon: <LocalParkingIcon fontSize="large" />,
              title: "Find Perfect Spots",
              description: "Search and compare parking options across the city based on location, price, and availability."
            },
            {
              icon: <PaymentIcon fontSize="large" />,
              title: "Easy Payments",
              description: "Secure your spot with our easy payment system. Pay online and avoid the hassle of cash or tickets."
            },
            {
              icon: <AccessTimeIcon fontSize="large" />,
              title: "Save Time",
              description: "No more circling around looking for parking. Book in advance and head straight to your spot."
            },
            {
              icon: <SecurityIcon fontSize="large" />,
              title: "Secure Parking",
              description: "All our partnered parking lots are monitored for security to keep your vehicle safe."
            }
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 8
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box 
                    sx={{ 
                      color: 'primary.main', 
                      display: 'flex', 
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* Popular Locations */}
      <Box sx={{ py: 6, backgroundColor: 'grey.100' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" mb={4}>
            Popular Parking Locations
          </Typography>
          
          <Grid container spacing={3}>
            {[
              { name: "Downtown Central", image: "https://source.unsplash.com/300x200/?downtown,city", spaces: 120 },
              { name: "Airport Terminal", image: "https://source.unsplash.com/300x200/?airport,terminal", spaces: 250 },
              { name: "Shopping Mall", image: "https://source.unsplash.com/300x200/?mall,shopping", spaces: 180 },
              { name: "Business District", image: "https://source.unsplash.com/300x200/?business,district", spaces: 90 }
            ].map((location, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.03)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={location.image}
                    alt={location.name}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h3">
                      {location.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {location.spaces} parking spaces available
                    </Typography>
                  </CardContent>
                  <Box px={2} pb={2}>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      fullWidth
                      component={Link}
                      to={`/parking/search?location=${encodeURIComponent(location.name)}`}
                    >
                      Find Spots
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box textAlign="center" mt={4}>
            <Button 
              variant="contained" 
              component={Link}
              to="/parking/search"
              endIcon={<SearchIcon />}
            >
              View All Locations
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* How It Works */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={6}>
          How ParkNSync Works
        </Typography>
        
        <Grid container spacing={4} alignItems="center">
          {[
            {
              step: 1,
              title: "Search for parking",
              description: "Enter your destination, date and time to see available parking options.",
              image: "https://source.unsplash.com/400x300/?map,search"
            },
            {
              step: 2,
              title: "Compare and book",
              description: "Compare prices, locations, and reviews. Select the best spot and book instantly.",
              image: "https://source.unsplash.com/400x300/?booking,calendar"
            },
            {
              step: 3,
              title: "Park with ease",
              description: "Use your booking confirmation to access the parking lot. No tickets or cash needed.",
              image: "https://source.unsplash.com/400x300/?parking,car"
            }
          ].map((step, index) => (
            <Grid item xs={12} key={index} sx={{ mb: 4 }}>
              <Paper 
                elevation={3}
                sx={{
                  p: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: { xs: 'column', md: index % 2 === 0 ? 'row' : 'row-reverse' }
                }}
              >
                <Box 
                  sx={{ 
                    width: { xs: '100%', md: '50%' },
                    position: 'relative'
                  }}
                >
                  <Box 
                    component="img"
                    src={step.image}
                    alt={`Step ${step.step}`}
                    sx={{ 
                      width: '100%',
                      height: { xs: 200, md: 300 },
                      objectFit: 'cover'
                    }}
                  />
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.25rem'
                    }}
                  >
                    {step.step}
                  </Box>
                </Box>
                
                <Box 
                  sx={{ 
                    width: { xs: '100%', md: '50%' },
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="h5" component="h3" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body1">
                    {step.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        <Box textAlign="center" mt={4}>
          <Button 
            variant="contained" 
            size="large"
            component={Link}
            to="/signup"
            sx={{ py: 1.5, px: 4 }}
          >
            Get Started Now
          </Button>
        </Box>
      </Container>
      
      {/* FAQ Section */}
      <Box sx={{ py: 8, backgroundColor: 'grey.100' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={6}>
            Frequently Asked Questions
          </Typography>
          
          {[
            {
              question: "How do I book a parking space?",
              answer: "Simply enter your destination, date, and time in our search form. Browse available options, select your preferred parking spot, and complete the booking with your payment details. You'll receive a confirmation email with a QR code to access the parking lot."
            },
            {
              question: "Can I cancel my booking?",
              answer: "Yes, you can cancel your booking up to 24 hours before your scheduled arrival time for a full refund. Cancellations made less than 24 hours in advance are subject to our cancellation policy."
            },
            {
              question: "Is my payment secure?",
              answer: "Absolutely. We use industry-standard encryption and secure payment processors to ensure your payment information is always protected."
            },
            {
              question: "What if I arrive late or leave early?",
              answer: "If you arrive later than your booking time, your spot will still be reserved for the duration of your booking. If you leave earlier than planned, you can simply exit the parking lot, but please note that we don't offer refunds for unused time."
            },
            {
              question: "How can I extend my parking time?",
              answer: "You can extend your parking time through our app or website up to the maximum allowed duration for that parking location, subject to availability."
            }
          ].map((faq, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
              >
                <Typography variant="h6" component="h3">
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1">
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          
          <Box textAlign="center" mt={4}>
            <Typography variant="body1" mb={2}>
              Didn't find what you're looking for?
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<PhoneIcon />}
              component={Link}
              to="/contact"
            >
              Contact Support
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 8, 
          background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
          color: 'white'
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Ready to Simplify Your Parking?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of drivers who save time and money with ParkNSync
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            size="large"
            component={Link}
            to="/signup"
            sx={{ 
              mr: 2, 
              py: 1.5,
              px: 4,
              mb: { xs: 2, sm: 0 }
            }}
          >
            Sign Up Free
          </Button>
          <Button 
            variant="outlined" 
            color="inherit"
            size="large"
            component={Link}
            to="/parking/search"
            sx={{ 
              borderColor: 'white',
              py: 1.5,
              px: 4
            }}
          >
            Find Parking
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 