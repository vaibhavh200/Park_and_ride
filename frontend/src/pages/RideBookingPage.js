import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const RideBookingPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ride Booking
        </Typography>
        <Typography variant="body1">
          Book a cab, shuttle, or e-rickshaw for your last-mile connectivity.
        </Typography>
      </Box>
    </Container>
  );
};

export default RideBookingPage; 