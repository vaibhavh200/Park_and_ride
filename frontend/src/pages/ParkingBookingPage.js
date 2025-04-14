import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const ParkingBookingPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Parking Booking
        </Typography>
        <Typography variant="body1">
          Book a parking spot at your chosen location.
        </Typography>
      </Box>
    </Container>
  );
};

export default ParkingBookingPage; 