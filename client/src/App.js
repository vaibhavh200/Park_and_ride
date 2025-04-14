import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { Toaster } from 'react-hot-toast';

// Layout components (placeholder imports)
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import NotFound from './components/layout/NotFound';

// Routes (placeholder imports)
import Dashboard from './components/dashboard/Dashboard';
import ParkingList from './components/parking/ParkingList';
import ParkingDetail from './components/parking/ParkingDetail';
import RidesList from './components/rides/RidesList';
import RideBooking from './components/rides/RideBooking';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import MetroStations from './components/metro/MetroStations';
import MyBookings from './components/bookings/MyBookings';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#4caf50',
            },
          },
          error: {
            style: {
              background: '#f44336',
            },
          },
        }}
      />
      <Router>
        <Header />
        <Container maxWidth="lg" style={{ paddingTop: '2rem', minHeight: 'calc(100vh - 160px)' }}>
          <Routes>
            <Route path="/" element={<Landing />} exact />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/parking" element={<ParkingList />} />
            <Route path="/parking/:id" element={<ParkingDetail />} />
            <Route path="/rides" element={<RidesList />} />
            <Route path="/rides/book/:serviceId" element={<RideBooking />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/metro" element={<MetroStations />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Container>
        <Footer />
      </Router>
    </ThemeProvider>
  );
}

export default App;
