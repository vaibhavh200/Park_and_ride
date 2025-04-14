import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const RidesHistoryPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ride History
        </Typography>
        <Typography variant="body1">
          View your past and upcoming rides.
        </Typography>
      </Box>
    </Container>
  );
};

export default RidesHistoryPage; 