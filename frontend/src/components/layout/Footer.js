import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#1976d2',
        color: 'white',
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="body1" align="center">
          &copy; {new Date().getFullYear()} Park & Ride. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 