import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Typography,
  Stack
} from '@mui/material';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import DirectionsTransitIcon from '@mui/icons-material/DirectionsTransit';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PaymentIcon from '@mui/icons-material/Payment';
import StarIcon from '@mui/icons-material/Star';

const Landing = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'primary.main',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(/img/hero-background.jpg)',
          height: '500px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {/* Remove or comment out this image tag that may be causing errors */}
        {/* <img 
          style={{ display: 'none' }} 
          src="/img/hero-background.jpg" 
          alt="background" 
        /> */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.6)',
          }}
        />
        <Container maxWidth="md">
          <Box sx={{ position: 'relative', p: { xs: 3, md: 6 } }}>
            <Typography component="h1" variant="h2" color="inherit" gutterBottom>
              Smart Urban Mobility Solution
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              Book parking spaces near metro stations and seamlessly connect to 
              your final destination with our integrated last-mile services.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mt: 3 }}
            >
              <Button 
                variant="contained" 
                size="large" 
                component={RouterLink} 
                to="/parking"
                startIcon={<LocalParkingIcon />}
              >
                Find Parking
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                color="inherit" 
                component={RouterLink} 
                to="/rides"
                startIcon={<LocalTaxiIcon />}
              >
                Book a Ride
              </Button>
            </Stack>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 6 }}>
          Our Key Features
        </Typography>
        <Grid container spacing={4}>
          {/* Feature 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <LocalParkingIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  Seamless Parking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pre-book parking spots near metro stations with real-time availability checks. 
                  Get allocated the best spot with flexible cancellation options.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <LocalTaxiIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  Last-Mile Rides
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Book cab, shuttle, or e-rickshaw rides for first and last-mile connectivity.
                  Options for instant booking or scheduled rides for perfect timing.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <QrCodeIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  Contactless Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  QR code-based entry and exit for parking. RFID and license plate recognition
                  for seamless access without manual intervention.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 4 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <DirectionsTransitIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  Metro Integration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Seamless integration with metro schedules. View real-time transit updates
                  and plan your journey with multi-modal options.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 5 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <PaymentIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  Smart Payment
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Integrated payment for all services. Dynamic pricing based on demand,
                  with subscription plans for regular commuters.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 6 */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <StarIcon color="primary" sx={{ fontSize: 60 }} />
                </Box>
                <Typography variant="h5" component="div" align="center" gutterBottom>
                  Loyalty Rewards
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Earn points for every booking. Redeem rewards for discounts on future
                  bookings and access premium features and services.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* CTA Section */}
        <Box my={8} p={4} bgcolor="primary.main" color="white" borderRadius={2}>
          <Typography variant="h4" align="center" gutterBottom>
            Ready to Transform Your Commute?
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Join thousands of smart commuters who have simplified their daily journey.
          </Typography>
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              component={RouterLink}
              to="/register"
            >
              Sign Up Now
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Landing;
