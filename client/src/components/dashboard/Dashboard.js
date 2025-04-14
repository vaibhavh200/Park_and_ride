import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
  Tab,
  Tabs
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Mock data for demonstration
const mockParkingBookings = [
  {
    id: 'PB001',
    parking: 'Central Metro Parking',
    status: 'Upcoming',
    date: '10 May 2023',
    time: '9:00 AM - 6:00 PM',
    amount: '₹220',
    spotNumber: 'A12'
  },
  {
    id: 'PB002',
    parking: 'North City Metro Parking',
    status: 'Active',
    date: 'Today',
    time: '8:00 AM - 5:00 PM',
    amount: '₹180',
    spotNumber: 'B05'
  },
  {
    id: 'PB003',
    parking: 'East Gate Parking',
    status: 'Completed',
    date: '28 April 2023',
    time: '10:00 AM - 3:00 PM',
    amount: '₹120',
    spotNumber: 'C22'
  }
];

const mockRideBookings = [
  {
    id: 'RB001',
    type: 'Cab',
    status: 'Upcoming',
    date: '10 May 2023',
    time: '6:00 PM',
    amount: '₹180',
    from: 'Central Metro Station',
    to: 'Tech Park'
  },
  {
    id: 'RB002',
    type: 'Shuttle',
    status: 'Completed',
    date: '2 May 2023',
    time: '5:30 PM',
    amount: '₹60',
    from: 'North Metro Station',
    to: 'Downtown'
  }
];

const Dashboard = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status) => {
    let color = '';
    let bgcolor = '';
    
    switch(status) {
      case 'Upcoming':
        color = '#2196f3';
        bgcolor = '#e3f2fd';
        break;
      case 'Active':
        color = '#4caf50';
        bgcolor = '#e8f5e9';
        break;
      case 'Completed':
        color = '#757575';
        bgcolor = '#eeeeee';
        break;
      default:
        color = '#757575';
        bgcolor = '#eeeeee';
    }
    
    return (
      <Box 
        component="span" 
        sx={{ 
          color,
          bgcolor,
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.8rem',
          fontWeight: 'medium',
          display: 'inline-block'
        }}
      >
        {status}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* User Profile Overview */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box display="flex" alignItems="center">
              <Box 
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: 50, 
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                <PersonIcon fontSize="large" />
              </Box>
              <Box>
                <Typography variant="h5">Welcome, John Doe</Typography>
                <Typography variant="body2" color="textSecondary">
                  Member since April 2023
                </Typography>
              </Box>
            </Box>
            <Box mt={{ xs: 2, sm: 0 }}>
              <Button 
                variant="outlined" 
                component={RouterLink} 
                to="/profile"
                startIcon={<PersonIcon />}
              >
                View Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Bookings
              </Typography>
              <Typography variant="h3">3</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Bookings
              </Typography>
              <Typography variant="h3">28</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Loyalty Points
              </Typography>
              <Typography variant="h3">450</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Savings
              </Typography>
              <Typography variant="h3">₹1,250</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Bookings Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab icon={<DirectionsCarIcon />} label="Parking Bookings" />
              <Tab icon={<LocalTaxiIcon />} label="Ride Bookings" />
            </Tabs>
            <Divider />

            {/* Parking Bookings Tab */}
            {tabValue === 0 && (
              <Box p={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Your Parking Bookings</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/parking"
                    startIcon={<DirectionsCarIcon />}
                  >
                    Book New Parking
                  </Button>
                </Box>
                
                <List>
                  {mockParkingBookings.map((booking) => (
                    <React.Fragment key={booking.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Box 
                            sx={{ 
                              bgcolor: 'primary.light', 
                              color: 'primary.contrastText',
                              borderRadius: '50%',
                              width: 40,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <DirectionsCarIcon />
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography variant="subtitle1" component="span">
                                {booking.parking}
                              </Typography>
                              <Box ml={2}>
                                {renderStatusBadge(booking.status)}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Box display="flex" alignItems="center" mt={1}>
                                <EventIcon fontSize="small" color="action" />
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary"
                                  sx={{ ml: 1 }}
                                >
                                  {booking.date}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <AccessTimeIcon fontSize="small" color="action" />
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary"
                                  sx={{ ml: 1 }}
                                >
                                  {booking.time}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <QrCodeIcon fontSize="small" color="action" />
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary"
                                  sx={{ ml: 1 }}
                                >
                                  Spot: {booking.spotNumber}
                                </Typography>
                              </Box>
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>
                            {booking.amount}
                          </Typography>
                          <IconButton edge="end" aria-label="more">
                            <MoreVertIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {/* Ride Bookings Tab */}
            {tabValue === 1 && (
              <Box p={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Your Ride Bookings</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/rides"
                    startIcon={<LocalTaxiIcon />}
                  >
                    Book New Ride
                  </Button>
                </Box>
                
                <List>
                  {mockRideBookings.map((booking) => (
                    <React.Fragment key={booking.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Box 
                            sx={{ 
                              bgcolor: 'secondary.light', 
                              color: 'secondary.contrastText',
                              borderRadius: '50%',
                              width: 40,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <LocalTaxiIcon />
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center">
                              <Typography variant="subtitle1" component="span">
                                {booking.type} - {booking.from} to {booking.to}
                              </Typography>
                              <Box ml={2}>
                                {renderStatusBadge(booking.status)}
                              </Box>
                            </Box>
                          }
                          secondary={
                            <React.Fragment>
                              <Box display="flex" alignItems="center" mt={1}>
                                <EventIcon fontSize="small" color="action" />
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary"
                                  sx={{ ml: 1 }}
                                >
                                  {booking.date}
                                </Typography>
                              </Box>
                              <Box display="flex" alignItems="center" mt={0.5}>
                                <AccessTimeIcon fontSize="small" color="action" />
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary"
                                  sx={{ ml: 1 }}
                                >
                                  {booking.time}
                                </Typography>
                              </Box>
                            </React.Fragment>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Typography variant="subtitle1" component="div" sx={{ mb: 1 }}>
                            {booking.amount}
                          </Typography>
                          <IconButton edge="end" aria-label="more">
                            <MoreVertIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
