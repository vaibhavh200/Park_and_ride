import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const BookingsHistoryPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Booking History
        </Typography>
        <Typography variant="body1">
          View your past and upcoming parking bookings.
        </Typography>
      </Box>
    </Container>
  );
};

export default BookingsHistoryPage; 