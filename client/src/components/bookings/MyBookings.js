import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Divider,
  Chip,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Alert,
  AlertTitle,
  Stack,
  CircularProgress
} from '@mui/material';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScheduleIcon from '@mui/icons-material/Schedule';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showQRCodeDialog, setShowQRCodeDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Add state for API data
  const [parkingBookings, setParkingBookings] = useState([]);
  const [rideBookings, setRideBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add state for cancellation policy
  const [cancellationDetails, setCancellationDetails] = useState({
    refundAmount: 0,
    refundPercentage: 0,
    hoursBeforeBooking: 0,
    isCancellable: true,
    reason: ''
  });

  // Function to fetch bookings - wrapped in useCallback to prevent dependency cycles
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch parking bookings
      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login', { state: { from: '/bookings', message: 'Please login to view your bookings' } });
        return;
      }
      
      const parkingResponse = await axios.get('/api/bookings/my-bookings', {
        headers: {
          'x-auth-token': token
        }
      });
      
      console.log('Booking data from API:', parkingResponse.data);
      
      if (parkingResponse.data.success) {
        // Transform data to match our UI needs
        const formattedParkingBookings = parkingResponse.data.data.map(booking => {
          const startTime = new Date(booking.startTime);
          const endTime = new Date(booking.endTime);
          
          // Map the booking status properly
          let uiStatus = booking.status;
          if (booking.status === 'booked') {
            uiStatus = 'upcoming';
          }
          
          console.log('Processing booking with MongoDB ID:', booking._id);
          
          return {
            id: booking.bookingCode || `BOOK-${booking._id.substr(-6)}`,
            _id: booking._id, // Keep MongoDB ID for API calls
            mongoId: booking._id, // Add additional property for clarity
            type: 'parking',
            location: booking.parkingSpot ? booking.parkingSpot.name : 'Unknown Location',
            date: startTime.toISOString().split('T')[0],
            timeSlot: `${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
            spotNumber: booking.spotNumber || 'Not assigned',
            status: uiStatus,
            vehicle: booking.vehicleDetails?.registrationNumber || 'Not specified',
            amount: booking.totalAmount,
            bookingDate: new Date(booking.createdAt || Date.now()).toISOString().split('T')[0],
            isPaid: booking.paymentStatus === 'completed',
            paymentStatus: booking.paymentStatus,
            qrCode: !!booking.qrCode,
            cancelReason: booking.cancellationReason,
            rating: booking.rating
          };
        });
        
        console.log('Formatted booking data:', formattedParkingBookings);
        setParkingBookings(formattedParkingBookings);
      }
      
      // Fetch ride bookings if needed
      // This is a placeholder for the actual API call
      // For now we'll use mock data
      setRideBookings([
        {
          id: 'R2001',
          type: 'ride',
          rideType: 'Taxi',
          pickup: 'Central Metro Station',
          dropoff: 'Tech Park, Sector 62',
          date: '2025-04-13',
          time: '06:30 PM',
          driverName: 'Rahul Singh',
          vehicle: 'Swift Dzire DL 01 XY 7890',
          status: 'upcoming',
          amount: 249,
          bookingDate: '2025-04-10',
          isPaid: true
        },
        {
          id: 'R2002',
          type: 'ride',
          rideType: 'E-Rickshaw',
          pickup: 'East Metro Station',
          dropoff: 'Residential Complex, Block B',
          date: '2025-04-08',
          time: '02:15 PM',
          driverName: 'Vikram Patel',
          vehicle: 'E-Rickshaw DL 01 R 5432',
          status: 'completed',
          amount: 60,
          bookingDate: '2025-04-08',
          isPaid: true,
          rating: 5
        }
      ]);
      
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load booking data. Please try again later.');
      
      // Use mock data as fallback
      setParkingBookings([
        {
          id: 'P1001',
          _id: '123456789012',
          type: 'parking',
          location: 'Central Metro Station Parking',
          date: '2025-04-12',
          timeSlot: '09:00 AM - 06:00 PM',
          spotNumber: 'A-42',
          status: 'upcoming',
          vehicle: 'DL 01 AB 1234',
          amount: 180,
          bookingDate: '2025-04-05',
          isPaid: true,
          qrCode: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Check for success message from location state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      
      // If there's a bookingId, set it as the current booking
      if (location.state.bookingId) {
        setCurrentBookingId(location.state.bookingId);
        // Open payment dialog if redirected from successful booking
        setShowPaymentDialog(true);
      }
      
      // Clear the location state after handling
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Function to close success message
  const handleCloseSuccessMessage = () => {
    setSuccessMessage('');
  };

  // Check authentication and fetch bookings
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login', { state: { from: '/bookings', message: 'Please login to view your bookings' } });
      return;
    }

    fetchBookings();
  }, [navigate, fetchBookings]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFilterClick = (event) => {
    setFilterMenuAnchor(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterMenuAnchor(null);
  };

  const handleActionClick = (event, bookingId, directAction = null) => {
    setCurrentBookingId(bookingId);
    
    // If a direct action is specified, perform it immediately
    if (directAction) {
      switch (directAction) {
        case 'payment':
          setShowPaymentDialog(true);
          return;
        case 'checkIn':
          handleCheckIn();
          return;
        case 'checkOut':
          handleCheckOut();
          return;
        case 'rate':
          setShowRatingDialog(true);
          return;
        default:
          // If not a direct action, show the menu
          break;
      }
    }
    
    // If there's an event (clicked on the menu button), show the menu
    if (event) {
      setActionMenuAnchor(event.currentTarget);
    }
  };

  const handleActionClose = () => {
    setActionMenuAnchor(null);
    setCurrentBookingId(null);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const handleDateFilterChange = (period) => {
    setDateFilter(period);
    handleFilterClose();
  };

  const handleOpenRatingDialog = () => {
    setShowRatingDialog(true);
    handleActionClose();
  };

  const handleCloseRatingDialog = () => {
    setShowRatingDialog(false);
    setRatingValue(0);
  };

  const handleSubmitRating = async () => {
    // In a real app, this would be an API call to submit rating
    console.log(`Submitting rating ${ratingValue} for booking ${currentBookingId}`);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        navigate('/login');
        return;
      }
      
      // Get the current booking
      const currentBooking = getCurrentBooking();
      if (!currentBooking) {
        setError('Could not find booking details');
        setShowRatingDialog(false);
        return;
      }
      
      // Get MongoDB ID for the current booking
      const mongoId = await getMongoId(currentBookingId);
      
      if (!mongoId) {
        setError('Could not find booking details in the database');
        setShowRatingDialog(false);
        return;
      }
      
      // Determine if it's a parking or ride booking
      const isRideBooking = currentBooking.type === 'ride';
      const endpoint = isRideBooking 
        ? `/api/rides/bookings/${mongoId}/rate` 
        : `/api/bookings/${mongoId}/rate`;
      
      console.log(`Sending rating request to ${endpoint}`);

      const response = await axios.put(endpoint, {
        rating: ratingValue,
        comment: document.querySelector('textarea[placeholder="Tell us about your experience"]')?.value || ''
      }, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Update the booking rating locally without full page reload
        if (isRideBooking) {
          const updatedRideBookings = rideBookings.map(booking => {
            if (booking.id === currentBookingId) {
              return { 
                ...booking, 
                rating: ratingValue
              };
            }
            return booking;
          });
          setRideBookings(updatedRideBookings);
        } else {
          const updatedParkingBookings = parkingBookings.map(booking => {
            if (booking.id === currentBookingId) {
              return { 
                ...booking, 
                rating: ratingValue
              };
            }
            return booking;
          });
          setParkingBookings(updatedParkingBookings);
        }
        
        setSuccessMessage('Rating submitted successfully!');
        toast.success('Rating submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      let errorMessage = 'Failed to submit rating. Please try again.';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setShowRatingDialog(false);
      setRatingValue(0);
    }
  };

  // Function to handle cancel dialog open with refund calculation
  const handleOpenCancelDialog = () => {
    const booking = getCurrentBooking();
    if (!booking) return;
    
    // Calculate time difference between now and booking time
    const now = new Date();
    const bookingDate = new Date(`${booking.date}T${booking.timeSlot.split(' - ')[0]}`);
    const hoursDifference = (bookingDate - now) / (1000 * 60 * 60);
    
    let refundPercentage = 0;
    let isCancellable = true;
    let reason = '';
    
    // Refund policy:
    // More than 24 hours: 100% refund
    // 12-24 hours: 75% refund
    // 4-12 hours: 50% refund
    // 2-4 hours: 25% refund
    // Less than 2 hours: No refund
    if (hoursDifference > 24) {
      refundPercentage = 100;
    } else if (hoursDifference > 12) {
      refundPercentage = 75;
    } else if (hoursDifference > 4) {
      refundPercentage = 50;
    } else if (hoursDifference > 2) {
      refundPercentage = 25;
    } else {
      refundPercentage = 0;
      
      // If less than 30 minutes, no cancellation allowed
      if (hoursDifference < 0.5) {
        isCancellable = false;
        reason = 'Cancellation is not allowed within 30 minutes of the booking time.';
      }
    }
    
    // Calculate refund amount
    const refundAmount = (booking.amount * refundPercentage) / 100;
    
    setCancellationDetails({
      refundAmount,
      refundPercentage,
      hoursBeforeBooking: Math.max(0, Math.round(hoursDifference * 10) / 10),
      isCancellable,
      reason
    });
    
    setShowCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setShowCancelDialog(false);
    setCancelReason('');
    setCancellationDetails({
      refundAmount: 0,
      refundPercentage: 0,
      hoursBeforeBooking: 0,
      isCancellable: true,
      reason: ''
    });
  };

  const handleSubmitCancel = async () => {
    if (!cancelReason || cancelReason.trim() === '') {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    
    if (!cancellationDetails.isCancellable) {
      toast.error(cancellationDetails.reason);
      return;
    }

    try {
      const booking = getCurrentBooking();
      if (!booking) {
        toast.error('Booking details not found');
        return;
      }

      // Show loading state
      toast.loading('Processing cancellation...');

      const token = localStorage.getItem('auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Make the cancellation API call
      const response = await axios.put(
        `/api/bookings/${booking._id || booking.mongoId}/cancel`,
        { cancellationReason: cancelReason },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      toast.dismiss();

      if (response.data.success) {
        toast.success(`Booking cancelled successfully. Refund amount: ₹${cancellationDetails.refundAmount}`);
        
        // Update local state
        if (booking.type === 'parking') {
          setParkingBookings(prev => 
            prev.map(b => 
              b.id === booking.id ? { ...b, status: 'cancelled', cancelReason } : b
            )
          );
        } else {
          setRideBookings(prev => 
            prev.map(b => 
              b.id === booking.id ? { ...b, status: 'cancelled', cancelReason } : b
            )
          );
        }
        
        // Close the dialog
        handleCloseCancelDialog();
        
        // Refresh all bookings after a short delay
        setTimeout(fetchBookings, 500);
      } else {
        toast.error(response.data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      toast.dismiss();
      console.error('Error cancelling booking:', error);
      
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Failed to cancel booking');
      } else {
        toast.error('Network error. Please try again.');
      }
    }
  };

  const filterBookings = (bookings) => {
    // No bookings to filter
    if (!bookings || bookings.length === 0) {
      return [];
    }
    
    return bookings.filter(booking => {
      // Filter by status
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
      }
      
      // Filter by date
      if (dateFilter !== 'all') {
        const bookingDate = new Date(booking.date);
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        if (dateFilter === 'last7days' && bookingDate < oneWeekAgo) {
          return false;
        } else if (dateFilter === 'last30days' && bookingDate < oneMonthAgo) {
          return false;
        }
      }
      
      return true;
    });
  };

  const getStatusChip = (status) => {
    switch(status) {
      case 'upcoming':
        return (
          <Chip 
            icon={<ScheduleIcon />} 
            label="Upcoming" 
            color="primary" 
            size="small" 
          />
        );
      case 'checked-out':
        return (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Checked Out" 
            color="success" 
            size="small" 
          />
        );
      case 'cancelled':
        return (
          <Chip 
            icon={<CancelIcon />} 
            label="Cancelled" 
            color="error" 
            size="small" 
          />
        );
      case 'checked-in':
        return (
          <Chip 
            icon={<CheckCircleIcon />} 
            label="Checked In" 
            color="info" 
            size="small" 
          />
        );
      default:
        return (
          <Chip 
            icon={<PendingIcon />} 
            label="Pending" 
            color="warning" 
            size="small" 
          />
        );
    }
  };

  const renderStarRating = (rating) => {
    if (!rating) return null;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Box component="span" key={i} sx={{ color: i <= rating ? 'gold' : 'grey.400' }}>
          {i <= rating ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        {stars}
      </Box>
    );
  };

  const getCurrentBooking = () => {
    console.log("Getting current booking with ID:", currentBookingId);
    console.log("Available parking bookings:", parkingBookings);
    console.log("Available ride bookings:", rideBookings);
    
    // Check both parking and ride bookings
    const parkingBooking = parkingBookings.find(booking => booking.id === currentBookingId);
    const rideBooking = rideBookings.find(booking => booking.id === currentBookingId);
    
    const foundBooking = parkingBooking || rideBooking;
    console.log("Found booking:", foundBooking);
    
    // Make sure _id is accessible
    if (foundBooking && !foundBooking._id && foundBooking.mongoId) {
      console.log("Setting _id from mongoId:", foundBooking.mongoId);
      foundBooking._id = foundBooking.mongoId;
    }
    
    return foundBooking;
  };

  // Function to handle payment for a booking
  const handleOpenPaymentDialog = () => {
    setShowPaymentDialog(true);
    handleActionClose();
  };
  
  const handleClosePaymentDialog = () => {
    setShowPaymentDialog(false);
  };
  
  const handleSubmitPayment = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        navigate('/login');
        return;
      }
      
      // Get MongoDB ID for the current booking
      const mongoId = await getMongoId(currentBookingId);
      
      if (!mongoId) {
        setError('Could not find booking details');
        toast.error('Could not find booking details');
        setShowPaymentDialog(false);
        return;
      }
      
      // Process payment for the booking
      const paymentResponse = await axios.put(`/api/bookings/${mongoId}/payment`, {
        paymentMethod: 'credit' // This would come from a form in a real app
      }, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (paymentResponse.data.success) {
        // Update the booking isPaid status locally without full page reload
        const updatedParkingBookings = parkingBookings.map(booking => {
          if (booking.id === currentBookingId) {
            return { 
              ...booking, 
              isPaid: true,
              paymentStatus: 'completed'
            };
          }
          return booking;
        });
        
        setParkingBookings(updatedParkingBookings);
        setSuccessMessage('Payment processed successfully!');
        toast.success('Payment processed successfully!');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment. Please try again.');
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setShowPaymentDialog(false);
    }
  };
  
  // Function to handle check-in for a booking
  const handleCheckIn = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        navigate('/login');
        return;
      }
      
      // Get MongoDB ID for the current booking
      const mongoId = await getMongoId(currentBookingId);
      
      if (!mongoId) {
        setError('Could not find booking details');
        toast.error('Could not find booking details');
        handleActionClose();
        return;
      }
      
      const response = await axios.put(`/api/bookings/${mongoId}/check-in`, {}, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Update the booking status locally without full page reload
        const updatedParkingBookings = parkingBookings.map(booking => {
          if (booking.id === currentBookingId) {
            return { ...booking, status: 'checked-in' };
          }
          return booking;
        });
        
        setParkingBookings(updatedParkingBookings);
        setSuccessMessage('Check-in successful!');
        toast.success('Check-in successful!');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      setError('Failed to check in. Please try again.');
      toast.error('Failed to check in. Please try again.');
    } finally {
      handleActionClose();
    }
  };
  
  // Function to handle check-out for a booking
  const handleCheckOut = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        navigate('/login');
        return;
      }
      
      // Get MongoDB ID for the current booking
      const mongoId = await getMongoId(currentBookingId);
      
      if (!mongoId) {
        setError('Could not find booking details');
        toast.error('Could not find booking details');
        handleActionClose();
        return;
      }
      
      const response = await axios.put(`/api/bookings/${mongoId}/check-out`, {}, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        // Update the booking status locally without full page reload
        const updatedParkingBookings = parkingBookings.map(booking => {
          if (booking.id === currentBookingId) {
            return { ...booking, status: 'checked-out' };
          }
          return booking;
        });
        
        setParkingBookings(updatedParkingBookings);
        setSuccessMessage('Check-out successful!');
        toast.success('Check-out successful!');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      setError('Failed to check out. Please try again.');
      toast.error('Failed to check out. Please try again.');
    } finally {
      handleActionClose();
    }
  };
  
  // Function to view QR code
  const handleOpenQRCodeDialog = () => {
    setShowQRCodeDialog(true);
    handleActionClose();
  };
  
  const handleCloseQRCodeDialog = () => {
    setShowQRCodeDialog(false);
  };

  // Helper function to get the MongoDB _id from a booking identifier
  const getMongoId = async (bookingId) => {
    // First look in our loaded bookings
    const bookings = [...parkingBookings, ...rideBookings];
    const fullBookingData = bookings.find(b => b.id === bookingId);
    
    console.log("Looking for MongoDB ID for booking:", bookingId);
    console.log("Found booking data:", fullBookingData);
    
    if (fullBookingData) {
      // If the booking has a direct _id property, use it
      if (fullBookingData._id) {
        console.log("Using _id from booking:", fullBookingData._id);
        return fullBookingData._id;
      }
      
      // If booking has mongoId property (for mock data), use it
      if (fullBookingData.mongoId) {
        console.log("Using mongoId from booking:", fullBookingData.mongoId);
        return fullBookingData.mongoId;
      }
    }
    
    // If not found locally, try the API
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        navigate('/login');
        return null;
      }
      
      // First try to fetch by booking code
      console.log("Fetching booking by code:", bookingId);
      const response = await axios.get(`/api/bookings/by-code/${bookingId}`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      if (response.data.success) {
        console.log("Found booking via code:", response.data.data);
        return response.data.data._id;
      }
    } catch (error) {
      console.error('Error finding booking by code:', error);
      
      // If that fails, try direct ID lookup only if it looks like a MongoDB ID
      if (bookingId.match(/^[0-9a-fA-F]{24}$/)) {
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            toast.error("Authentication required. Please log in again.");
            navigate('/login');
            return null;
          }
          
          const response = await axios.get(`/api/bookings/${bookingId}`, {
            headers: {
              'x-auth-token': token
            }
          });
          
          if (response.data.success) {
            console.log("Found booking via direct ID:", response.data.data);
            return bookingId; // In this case, the bookingId is already the MongoDB ID
          }
        } catch (secondError) {
          console.error('Error finding booking by direct ID:', secondError);
        }
      }
    }
    
    console.error("Could not find MongoDB ID for booking:", bookingId);
    toast.error("Could not find booking details. Please refresh and try again.");
    return null;
  };

  const handleOpenReceiptDialog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        navigate('/login');
        return;
      }
      
      console.log("Current booking ID:", currentBookingId);
      console.log("All parking bookings:", parkingBookings);
      
      const booking = getCurrentBooking();
      console.log("Found booking:", booking);
      
      if (!booking) {
        toast.error("Booking details not found. Please refresh the page.");
        setLoading(false);
        return;
      }
      
      // Get MongoDB ID from booking
      const mongoId = booking._id || booking.mongoId;
      
      if (!mongoId) {
        toast.error('MongoDB ID not found for this booking. Please contact support.');
        setLoading(false);
        return;
      }
      
      console.log("Fetching receipt for MongoDB ID:", mongoId);
      
      try {
        // Fetch receipt data directly using MongoDB ID
        const response = await axios.get(`/api/bookings/${mongoId}/receipt`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        if (response.data.success) {
          console.log("Receipt data received:", response.data);
          // Store receipt data in localStorage for PDF generation
          localStorage.setItem('receiptData', JSON.stringify(response.data.data));
          setShowReceiptDialog(true);
          handleActionClose();
        } else {
          toast.error('Failed to generate receipt: ' + (response.data.message || "Unknown error"));
        }
      } catch (receiptError) {
        console.error('Error fetching receipt:', receiptError.response || receiptError);
        
        // Try alternate approach - get booking first, then receipt
        try {
          // First get the booking to confirm it exists
          const bookingResponse = await axios.get(`/api/bookings/${mongoId}`, {
            headers: {
              'x-auth-token': token
            }
          });
          
          if (bookingResponse.data.success) {
            console.log("Booking data confirmed:", bookingResponse.data);
            
            // Now try receipt again
            const receiptResponse = await axios.get(`/api/bookings/${mongoId}/receipt`, {
              headers: {
                'x-auth-token': token
              }
            });
            
            if (receiptResponse.data.success) {
              localStorage.setItem('receiptData', JSON.stringify(receiptResponse.data.data));
              setShowReceiptDialog(true);
              handleActionClose();
            } else {
              toast.error('Still failed to generate receipt');
            }
          } else {
            toast.error('Could not confirm booking exists');
          }
        } catch (secondError) {
          console.error('Second attempt error:', secondError.response || secondError);
          toast.error('Error generating receipt: ' + (receiptError.response?.data?.message || receiptError.message));
        }
      }
    } catch (error) {
      console.error('Top-level error generating receipt:', error.response || error);
      toast.error('Error generating receipt: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseReceiptDialog = () => {
    setShowReceiptDialog(false);
  };
  
  const handlePrintReceipt = () => {
    const receiptElement = document.getElementById('receipt-content');
    
    // Use html2pdf.js to generate PDF from the receipt content
    const opt = {
      margin: 10,
      filename: `Receipt-${currentBookingId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().from(receiptElement).set(opt).save();
    
    // Track the receipt download for analytics
    console.log(`Receipt downloaded for booking ${currentBookingId}`);
  };

  // Show loading spinner when loading data
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Bookings
        </Typography>
        
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
            onClose={handleCloseSuccessMessage}
          >
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="booking tabs">
            <Tab 
              icon={<LocalParkingIcon />} 
              label="Parking" 
              id="booking-tab-0" 
              aria-controls="booking-tabpanel-0"
              iconPosition="start"
            />
            <Tab 
              icon={<LocalTaxiIcon />} 
              label="Rides" 
              id="booking-tab-1" 
              aria-controls="booking-tabpanel-1"
              iconPosition="start"
            />
          </Tabs>
          
          <Button
            startIcon={<FilterListIcon />}
            onClick={handleFilterClick}
            aria-controls="filter-menu"
            aria-haspopup="true"
          >
            Filter
          </Button>
          
          <Menu
            id="filter-menu"
            anchorEl={filterMenuAnchor}
            keepMounted
            open={Boolean(filterMenuAnchor)}
            onClose={handleFilterClose}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2">Status</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilterChange('all')}>
              All Statuses
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilterChange('upcoming')}>
              Upcoming
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilterChange('checked-out')}>
              Completed
            </MenuItem>
            <MenuItem onClick={() => handleStatusFilterChange('cancelled')}>
              Cancelled
            </MenuItem>
            <Divider />
            <MenuItem disabled>
              <Typography variant="subtitle2">Date</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleDateFilterChange('all')}>
              All Time
            </MenuItem>
            <MenuItem onClick={() => handleDateFilterChange('last7days')}>
              Last 7 Days
            </MenuItem>
            <MenuItem onClick={() => handleDateFilterChange('last30days')}>
              Last 30 Days
            </MenuItem>
          </Menu>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {parkingBookings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <LocalParkingIcon color="primary" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Parking Bookings
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't made any parking bookings yet.
              </Typography>
              <Button variant="contained" color="primary" onClick={() => navigate('/parking')}>
                Book Parking
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filterBookings(parkingBookings).map((booking) => (
                <Grid item xs={12} md={6} key={booking.id}>
                  <BookingCard 
                    booking={booking}
                    onActionClick={handleActionClick}
                    getStatusChip={getStatusChip}
                    renderStarRating={renderStarRating}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {rideBookings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <LocalTaxiIcon color="primary" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Ride Bookings
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You haven't made any ride bookings yet.
              </Typography>
              <Button variant="contained" color="primary" onClick={() => navigate('/rides')}>
                Book Ride
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filterBookings(rideBookings).map((booking) => (
                <Grid item xs={12} md={6} key={booking.id}>
                  <BookingCard 
                    booking={booking}
                    onActionClick={handleActionClick}
                    getStatusChip={getStatusChip}
                    renderStarRating={renderStarRating}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        {/* Action Menu */}
        <Menu
          id="action-menu"
          anchorEl={actionMenuAnchor}
          keepMounted
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionClose}
        >
          {getCurrentBooking()?.status === 'checked-out' && !getCurrentBooking()?.rating && (
            <MenuItem onClick={handleOpenRatingDialog}>
              <StarIcon fontSize="small" sx={{ mr: 1 }} />
              Rate Experience
            </MenuItem>
          )}
          
          {getCurrentBooking()?.status === 'upcoming' && !getCurrentBooking()?.isPaid && (
            <MenuItem onClick={handleOpenPaymentDialog}>
              <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
              Make Payment
            </MenuItem>
          )}
          
          {getCurrentBooking()?.status === 'upcoming' && getCurrentBooking()?.isPaid && (
            <MenuItem onClick={handleCheckIn}>
              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Check In
            </MenuItem>
          )}
          
          {getCurrentBooking()?.status === 'checked-in' && (
            <MenuItem onClick={handleCheckOut}>
              <ExitToAppIcon fontSize="small" sx={{ mr: 1 }} />
              Check Out
            </MenuItem>
          )}
          
          {getCurrentBooking()?.status === 'upcoming' && (
            <MenuItem onClick={handleOpenCancelDialog}>
              <CancelIcon fontSize="small" sx={{ mr: 1 }} />
              Cancel Booking
            </MenuItem>
          )}
          
          {getCurrentBooking()?.qrCode && (
            <MenuItem onClick={handleOpenQRCodeDialog}>
              <QrCodeIcon fontSize="small" sx={{ mr: 1 }} />
              View QR Code
            </MenuItem>
          )}
          
          <MenuItem onClick={handleOpenReceiptDialog}>
            <ReceiptIcon fontSize="small" sx={{ mr: 1 }} />
            View Receipt
          </MenuItem>
        </Menu>
        
        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onClose={handleClosePaymentDialog}>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              Complete payment for your booking {currentBookingId}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  defaultValue="credit"
                  label="Payment Method"
                >
                  <MenuItem value="credit">Credit Card</MenuItem>
                  <MenuItem value="debit">Debit Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="wallet">Wallet</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Expiry"
                  placeholder="MM/YY"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="CVV"
                  placeholder="123"
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                Payment Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Amount:</Typography>
                <Typography>₹{getCurrentBooking()?.amount || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Tax (18%):</Typography>
                <Typography>₹{Math.round((getCurrentBooking()?.amount || 0) * 0.18)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1">Total:</Typography>
                <Typography variant="subtitle1">₹{Math.round((getCurrentBooking()?.amount || 0) * 1.18)}</Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitPayment} 
              color="primary" 
              variant="contained"
            >
              Pay Now
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Receipt Dialog */}
        <Dialog 
          open={showReceiptDialog} 
          onClose={handleCloseReceiptDialog}
          maxWidth="md"
          PaperProps={{ sx: { minWidth: '600px' } }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>Receipt / Invoice</Box>
            <Button 
              variant="contained" 
              color="primary" 
              size="small"
              onClick={handlePrintReceipt}
              startIcon={<ReceiptIcon />}
            >
              Download PDF
            </Button>
          </DialogTitle>
          <DialogContent>
            {(() => {
              // Get receipt data from localStorage
              const receiptDataStr = localStorage.getItem('receiptData');
              const receiptData = receiptDataStr ? JSON.parse(receiptDataStr) : null;
              
              if (!receiptData) {
                return (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1">Receipt data not available</Typography>
                  </Box>
                );
              }
              
              return (
                <Box id="receipt-content" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                      <Typography variant="h6">{receiptData.company.name}</Typography>
                      <Typography variant="body2">{receiptData.company.address}</Typography>
                      <Typography variant="body2">Email: {receiptData.company.email}</Typography>
                      <Typography variant="body2">Phone: {receiptData.company.phone}</Typography>
                      <Typography variant="body2">Tax ID: {receiptData.company.taxId}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6">RECEIPT</Typography>
                      <Typography variant="body2">Booking ID: {receiptData.bookingId}</Typography>
                      <Typography variant="body2">Date: {receiptData.dateCreated}</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Customer</Typography>
                    <Typography variant="body2">Name: {receiptData.user.name}</Typography>
                    <Typography variant="body2">Email: {receiptData.user.email}</Typography>
                    {receiptData.user.phone && (
                      <Typography variant="body2">Phone: {receiptData.user.phone}</Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Booking Details</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Location:</strong> {receiptData.parking.name}, {receiptData.parking.location}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Check-in:</strong> {receiptData.timeSlot.startDate} at {receiptData.timeSlot.startTime}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Check-out:</strong> {receiptData.timeSlot.endDate} at {receiptData.timeSlot.endTime}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Duration:</strong> {receiptData.timeSlot.duration.hours} hours ({receiptData.timeSlot.duration.days} days)
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          <strong>Vehicle:</strong> {receiptData.vehicle && typeof receiptData.vehicle === 'object' ? 
                            `${receiptData.vehicle.model || 'N/A'}, ${receiptData.vehicle.color || 'N/A'}` : 'Vehicle details not available'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Registration:</strong> {receiptData.vehicle && typeof receiptData.vehicle === 'object' ?
                            receiptData.vehicle.registrationNumber || 'Not provided' : 'Not provided'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Booking Status:</strong> {receiptData.status ? receiptData.status.toUpperCase() : 'UNKNOWN'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Payment Status:</strong> {receiptData.paymentStatus ? receiptData.paymentStatus.toUpperCase() : 'UNKNOWN'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Payment Details</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Base Amount:</Typography>
                      <Typography variant="body2">₹{receiptData.payment?.baseAmount?.toFixed(2) || '0.00'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Tax (18%):</Typography>
                      <Typography variant="body2">₹{receiptData.payment?.tax?.toFixed(2) || '0.00'}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1">Total Amount:</Typography>
                      <Typography variant="subtitle1">₹{receiptData.payment?.totalAmount?.toFixed(2) || '0.00'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Payment Method:</Typography>
                      <Typography variant="body2">{receiptData.payment?.method ? receiptData.payment.method.toUpperCase() : 'NOT SPECIFIED'}</Typography>
                    </Box>
                    {receiptData.payment?.date && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Payment Date:</Typography>
                        <Typography variant="body2">{receiptData.payment.date}</Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 4, textAlign: 'center' }}>
                      Thank you for choosing {receiptData.company.name}. We hope to see you again soon!
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                      This is a computer-generated receipt and does not require a signature.
                    </Typography>
                  </Box>
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseReceiptDialog}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* QR Code Dialog */}
        <Dialog open={showQRCodeDialog} onClose={handleCloseQRCodeDialog}>
          <DialogTitle>Entry QR Code</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Box 
                component="img" 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${currentBookingId}`}
                alt="QR Code"
                sx={{ width: 200, height: 200, mb: 2 }}
              />
              <Typography variant="body2">
                Show this QR code at the parking entrance for check-in.
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Booking ID: {currentBookingId}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseQRCodeDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Rating Dialog */}
        <Dialog open={showRatingDialog} onClose={handleCloseRatingDialog}>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              How would you rate your experience with booking {currentBookingId}?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  onClick={() => setRatingValue(star)}
                  sx={{ color: star <= ratingValue ? 'gold' : 'grey.400' }}
                >
                  <StarIcon fontSize="large" />
                </IconButton>
              ))}
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comments (Optional)"
              variant="outlined"
              placeholder="Tell us about your experience"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseRatingDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmitRating} 
              color="primary" 
              variant="contained"
              disabled={ratingValue === 0}
            >
              Submit Rating
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Cancellation Dialog */}
        <Dialog open={showCancelDialog} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogContent>
            {cancellationDetails.isCancellable ? (
              <>
                <Typography variant="body1" gutterBottom>
                  Are you sure you want to cancel this booking?
                </Typography>

                {/* Cancellation Policy Information */}
                <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Cancellation Policy
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Time until booking:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {cancellationDetails.hoursBeforeBooking} hours
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Refund percentage:</Typography>
                    <Typography variant="body2" fontWeight="bold" color={cancellationDetails.refundPercentage > 0 ? 'success.main' : 'error.main'}>
                      {cancellationDetails.refundPercentage}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Estimated refund:</Typography>
                    <Typography variant="body2" fontWeight="bold" color={cancellationDetails.refundAmount > 0 ? 'success.main' : 'error.main'}>
                      ₹{cancellationDetails.refundAmount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    • More than 24 hours: 100% refund<br />
                    • 12-24 hours: 75% refund<br />
                    • 4-12 hours: 50% refund<br />
                    • 2-4 hours: 25% refund<br />
                    • Less than 2 hours: No refund
                  </Typography>
                </Box>

                <TextField
                  autoFocus
                  margin="dense"
                  label="Reason for cancellation"
                  fullWidth
                  multiline
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                  variant="outlined"
                />
              </>
            ) : (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Cannot Cancel Booking
                </Typography>
                <Typography variant="body2">
                  {cancellationDetails.reason}
                </Typography>
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCancelDialog}>
              {cancellationDetails.isCancellable ? 'Back' : 'Close'}
            </Button>
            {cancellationDetails.isCancellable && (
              <Button 
                onClick={handleSubmitCancel} 
                color="error" 
                variant="contained"
                disabled={!cancelReason || cancelReason.trim() === ''}
              >
                Cancel Booking
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

// Booking Card Component
const BookingCard = ({ booking, onActionClick, getStatusChip, renderStarRating }) => {
  const isParkingBooking = booking.type === 'parking';
  
  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isParkingBooking ? (
              <LocalParkingIcon color="primary" sx={{ fontSize: 30, mr: 1.5 }} />
            ) : (
              <LocalTaxiIcon color="primary" sx={{ fontSize: 30, mr: 1.5 }} />
            )}
            <Typography variant="h6">
              {isParkingBooking ? 'Parking Booking' : `${booking.rideType} Booking`}
            </Typography>
          </Box>
          <Box>
            {getStatusChip(booking.status)}
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {booking.id}
          </Typography>
          
          {booking._id && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              MongoDB ID: {booking._id}
            </Typography>
          )}
          
          <Grid container spacing={1} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {isParkingBooking ? (
                    booking.location
                  ) : (
                    <>From: {booking.pickup} To: {booking.dropoff}</>
                  )}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{booking.date}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {isParkingBooking ? booking.timeSlot : booking.time}
                </Typography>
              </Box>
            </Grid>
            {isParkingBooking && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Spot: {booking.spotNumber} • Vehicle: {booking.vehicle}
                </Typography>
              </Grid>
            )}
            {!isParkingBooking && booking.driverName && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Driver: {booking.driverName} • Vehicle: {booking.vehicle}
                </Typography>
              </Grid>
            )}
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              <ReceiptLongIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
              Total: ₹{booking.amount}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {booking.isPaid ? (
                <>
                  <PaymentIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'success.main' }} />
                  Paid
                </>
              ) : (
                <>
                  <PaymentIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5, color: 'warning.main' }} />
                  Pending
                </>
              )}
            </Typography>
          </Box>
          
          {booking.rating && renderStarRating(booking.rating)}
          
          {booking.status === 'cancelled' && booking.cancelReason && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="error">
                Cancelled: {booking.cancelReason}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      <CardActions>
        <Button 
          size="small" 
          startIcon={<ReceiptIcon />}
        >
          View Details
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton 
          size="small"
          onClick={(e) => onActionClick(e, booking.id)}
        >
          <MoreVertIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default MyBookings; 