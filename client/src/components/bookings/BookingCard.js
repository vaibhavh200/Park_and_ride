import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Divider,
  Button,
  IconButton,
  Grid
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

const BookingCard = ({ booking, onActionClick, getStatusChip, renderStarRating }) => {
  const getActionButtonText = () => {
    if (booking.status === 'upcoming') {
      if (!booking.isPaid) {
        return 'Pay Now';
      } else {
        return 'Check In';
      }
    } else if (booking.status === 'checked-in') {
      return 'Check Out';
    } else if (booking.status === 'checked-out' && !booking.rating) {
      return 'Rate';
    }
    return null;
  };

  const getActionButton = () => {
    const buttonText = getActionButtonText();
    if (!buttonText) return null;

    const buttonAction = () => {
      switch (buttonText) {
        case 'Pay Now':
          onActionClick(null, booking.id, 'payment');
          break;
        case 'Check In':
          onActionClick(null, booking.id, 'checkIn');
          break;
        case 'Check Out':
          onActionClick(null, booking.id, 'checkOut');
          break;
        case 'Rate':
          onActionClick(null, booking.id, 'rate');
          break;
        default:
          onActionClick(null, booking.id);
      }
    };

    return (
      <Button
        variant="contained"
        color={
          buttonText === 'Pay Now' ? 'warning' :
          buttonText === 'Check In' || buttonText === 'Check Out' ? 'primary' :
          'success'
        }
        onClick={buttonAction}
        fullWidth
      >
        {buttonText}
      </Button>
    );
  };

  const getDisplayStatus = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'booked': return 'Booked';
      case 'checked-in': return 'Checked In';
      case 'checked-out': return 'Checked Out';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card elevation={2}>
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {booking.type === 'parking' ? (
              <LocalParkingIcon color="primary" sx={{ mr: 1 }} />
            ) : (
              <LocalTaxiIcon color="primary" sx={{ mr: 1 }} />
            )}
            <Typography variant="h6">
              {booking.type === 'parking' ? 'Parking' : booking.rideType}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getStatusChip(booking.status)}
            <IconButton 
              size="small" 
              onClick={(e) => onActionClick(e, booking.id)}
              sx={{ ml: 1 }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ConfirmationNumberIcon color="action" fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Booking ID: {booking.id}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {booking.type === 'parking' ? booking.location : `${booking.pickup} to ${booking.dropoff}`}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {booking.date}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {booking.timeSlot || booking.time}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DirectionsCarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" noWrap>
                {booking.vehicle}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">
                ₹{booking.amount}
              </Typography>
              {booking.isPaid && <PaymentIcon color="success" fontSize="small" sx={{ ml: 0.5 }} />}
            </Box>
          </Grid>
        </Grid>

        {booking.cancelReason && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="caption" color="error.dark">
              Cancelled: {booking.cancelReason}
            </Typography>
          </Box>
        )}

        {booking.rating && (
          <Box sx={{ mt: 1 }}>
            {renderStarRating(booking.rating)}
          </Box>
        )}
      </CardContent>
      
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', px: 2, py: 1 }}>
        {booking.qrCode && (
          <Button 
            startIcon={<QrCodeIcon />} 
            size="small"
            onClick={(e) => {
              onActionClick(e, booking.id);
              document.querySelector(`[data-testid="QrCodeIcon"]`).closest('li').click();
            }}
          >
            Show QR
          </Button>
        )}
        
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {getActionButton()}
        </Box>
      </CardActions>
    </Card>
  );
};

export default BookingCard; 