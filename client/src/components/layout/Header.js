import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Link
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const pages = [
  { title: 'Parking', path: '/parking' },
  { title: 'Metro Stations', path: '/metro' },
  { title: 'Rides', path: '/rides' },
  { title: 'My Bookings', path: '/bookings' }
];

const authPages = [
  { title: 'Login', path: '/login' },
  { title: 'Register', path: '/register' }
];

const userSettings = [
  { title: 'Dashboard', path: '/dashboard', icon: <DashboardIcon fontSize="small" sx={{ mr: 1 }} /> },
  { title: 'Profile', path: '/profile', icon: <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} /> },
  { title: 'Logout', path: '/logout', icon: <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> }
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check for authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    if (token) {
      setIsAuthenticated(true);
      try {
        setUser(userData ? JSON.parse(userData) : null);
      } catch (error) {
        console.error('Error parsing user data', error);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Listen for storage events to sync authentication across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'auth_token') {
        if (e.newValue) {
          setIsAuthenticated(true);
          const userData = localStorage.getItem('user');
          try {
            setUser(userData ? JSON.parse(userData) : null);
          } catch (error) {
            console.error('Error parsing user data', error);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } else if (e.key === 'user' && e.newValue) {
        try {
          setUser(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing user data', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Check auth status on route changes
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (token) {
      setIsAuthenticated(true);
      try {
        setUser(userData ? JSON.parse(userData) : null);
      } catch (error) {
        console.error('Error parsing user data', error);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location.pathname]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    // Update component state
    setIsAuthenticated(false);
    setUser(null);
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new Event('storage'));
    
    // Navigate and close menu
    navigate('/');
    handleCloseUserMenu();
    
    // Optional: Show logout success message
    console.log('Successfully logged out');
  };

  const handleMenuItemClick = (path) => {
    if (path === '/logout') {
      handleLogout();
    } else {
      navigate(path);
      handleCloseUserMenu();
    }
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo - Desktop */}
          <DirectionsCarIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            PARK & RIDE
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                  <Link
                    component={RouterLink}
                    to={page.path}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Typography textAlign="center">{page.title}</Typography>
                  </Link>
                </MenuItem>
              ))}
              
              {isAuthenticated && (
                <MenuItem onClick={() => handleMenuItemClick('/dashboard')}>
                  <DashboardIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography textAlign="center">Dashboard</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Logo - Mobile */}
          <DirectionsCarIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            P&R
          </Typography>

          {/* Desktop menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page.title}
              </Button>
            ))}
            
            {isAuthenticated && (
              <Button
                component={RouterLink}
                to="/dashboard"
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
                startIcon={<DashboardIcon />}
              >
                Dashboard
              </Button>
            )}
          </Box>

          {/* User menu or Auth buttons */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Account settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={user?.name || 'User'} 
                      src="/static/images/avatar/2.jpg"
                      sx={{ bgcolor: 'secondary.main' }}
                    >
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {userSettings.map((setting) => (
                    <MenuItem 
                      key={setting.title} 
                      onClick={() => handleMenuItemClick(setting.path)}
                    >
                      {setting.icon}
                      <Typography textAlign="center">{setting.title}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex' }}>
                {authPages.map((page) => (
                  <Button
                    key={page.title}
                    component={RouterLink}
                    to={page.path}
                    variant={page.title === 'Register' ? 'contained' : 'outlined'}
                    sx={{ 
                      color: page.title === 'Register' ? 'white' : 'white',
                      bgcolor: page.title === 'Register' ? 'secondary.main' : 'transparent',
                      '&:hover': {
                        bgcolor: page.title === 'Register' ? 'secondary.dark' : 'rgba(255, 255, 255, 0.08)'
                      },
                      display: 'block', 
                      mx: 1,
                      borderColor: 'white'
                    }}
                  >
                    {page.title}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
