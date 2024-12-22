import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Divider } from '@mui/material';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/system';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { FaSearch } from 'react-icons/fa';
import AuthPopup from './AuthPopup';
import api from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import MenuIcon from '@mui/icons-material/Menu';

const Logo = styled('img')({
  cursor: 'pointer',
  flexGrow: 1,
  height: '60px',
});

const Navbar = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setLoggedInUser(storedUsername);
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications/');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notification => !notification.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('s');
    api.defaults.headers.common['Authorization'] = '';
    window.location.href = '/';
  };

  const handleAboutUs = () => {
    navigate("/about-us/");
  };

  const handleFavoritesOpen = () => {
    navigate("/favorites/");
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleBookingOpen = () => {
    const suppliertag = localStorage.getItem('s');
    if (suppliertag) {
      navigate('/supplier-bookings');
    } else {
      navigate('/bookings');
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileOpen = () => {
    navigate('/profile');
  }

  const handleNotificationClick = () => {
    navigate('/bookings');
  };

  const handleNotificationOpen = async (event) => {
    setNotificationAnchorEl(event.currentTarget);

    // Mark notifications as read
    try {
      const unreadNotifications = notifications.filter(notification => !notification.read);
      for (const notification of unreadNotifications) {
        await api.put(`/api/readnotification/${notification.id}/`);
      }
      fetchNotifications();  // Fetch notifications again to update the state
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const mainNavItems = (
    <div className="desktop-menu">
      <Button color="inherit" onClick={() => navigate('/blog')}>Blog</Button>
      <Button color="inherit" onClick={handleAboutUs}>About Us</Button>
      <Button color="inherit" onClick={() => navigate('/contact-us')}>Contact Us</Button>
    </div>
  );

  return (
    <AppBar 
        position="static"
        style={{
            background:"white",
            padding:'20px',
        }}
    >
      <Toolbar>
        <Typography onClick={() => navigate('/')} variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Logo className='lb-logo'
            src="/lebadvisor_logo.png" 
            alt="LebAdvisor Logo" 
          />
        </Typography>

        <IconButton
          className="mobile-menu-button"
          onClick={handleMobileMenuOpen}
          sx={{ marginRight: '10px' }}
        >
          <MenuIcon style={{ color: '#017599' }} />
        </IconButton>

        <Menu
          className='nav-menu'
          anchorEl={mobileAnchorEl}
          open={Boolean(mobileAnchorEl)}
          onClose={handleMobileMenuClose}
        >
          <MenuItem onClick={() => { navigate('/blog'); handleMobileMenuClose(); }}>
            Blog
          </MenuItem>
          <MenuItem onClick={() => { handleAboutUs(); handleMobileMenuClose(); }}>
            About Us
          </MenuItem>
          <MenuItem onClick={() => { navigate('/contact-us'); handleMobileMenuClose(); }}>
            Contact Us
          </MenuItem>
        </Menu>

        {mainNavItems}

        {loggedInUser ? (
          <div>
            <IconButton
              className="notification-button"
              onClick={handleNotificationOpen}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon className="not-icon" />
              </Badge>
            </IconButton>
            <IconButton onClick={handleMenu}>
              <Avatar className='user-icon'>{loggedInUser[0].toUpperCase()}</Avatar>
            </IconButton>
            <Menu
              className='nav-menu'
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleProfileOpen}>Profile</MenuItem>
              <MenuItem onClick={handleBookingOpen}>Bookings</MenuItem>
              <MenuItem onClick={handleFavoritesOpen}>Favorites</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>

            {/* Notifications Menu */}
            <Menu
              className='nav-menu'
              anchorEl={notificationAnchorEl}
              open={Boolean(notificationAnchorEl)}
              onClose={handleNotificationClose}
            >
              {notifications
                .sort((a, b) => {
                  if (a.read === b.read) {
                    return new Date(b.created_at) - new Date(a.created_at);
                  }
                  return a.read ? 1 : -1;
                })
                .slice(0, 10)
                .map((notification) => (
                  <MenuItem key={notification.id} onClick={handleNotificationClick} className="menu-item">
                    {notification.message}
                  </MenuItem>
                ))}
              <MenuItem 
                onClick={() => navigate('/notifications')}
                className="menu-item read-all"
                style={{ color: 'darkorange', fontWeight: 'bold' }}
              >
                Read all
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <AuthPopup />
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;