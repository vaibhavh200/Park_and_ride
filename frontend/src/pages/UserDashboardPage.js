import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const UserDashboardPage = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Dashboard
        </Typography>
        <Typography variant="body1">
          View and manage your account, bookings, and rides.
        </Typography>
      </Box>
    </Container>
  );
};

export default UserDashboardPage; 