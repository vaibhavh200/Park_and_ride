import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context providers
import { AuthProvider } from './context/AuthContext';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ParkingSearchPage from './pages/ParkingSearchPage';
import ParkingBookingPage from './pages/ParkingBookingPage';
import RideBookingPage from './pages/RideBookingPage';
import UserDashboardPage from './pages/UserDashboardPage';
import BookingsHistoryPage from './pages/BookingsHistoryPage';
import RidesHistoryPage from './pages/RidesHistoryPage';
import NotFoundPage from './pages/NotFoundPage';

// Private route component
import PrivateRoute from './components/auth/PrivateRoute';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 128px)', padding: '20px 0' }}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/parking/search" element={<ParkingSearchPage />} />
              
              {/* Protected routes */}
              <Route path="/parking/book/:id" element={
                <PrivateRoute>
                  <ParkingBookingPage />
                </PrivateRoute>
              } />
              <Route path="/ride/book" element={
                <PrivateRoute>
                  <RideBookingPage />
                </PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <UserDashboardPage />
                </PrivateRoute>
              } />
              <Route path="/bookings" element={
                <PrivateRoute>
                  <BookingsHistoryPage />
                </PrivateRoute>
              } />
              <Route path="/rides" element={
                <PrivateRoute>
                  <RidesHistoryPage />
                </PrivateRoute>
              } />
              
              {/* Not Found */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 