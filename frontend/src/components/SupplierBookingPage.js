import React, { useState, useEffect } from 'react';
import {
  Container,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import {
  FaTasks,
  FaBoxes,
  FaRoute,
  FaCheck,
  FaUserFriends,
  FaMoneyBillWave,
  FaUsers,
  FaCalendarTimes,
  FaBiking,
  FaSuitcaseRolling,
  FaRoute as FaRouteIcon
} from 'react-icons/fa';

import api from '../services/api';
import ActivityCard from './supplier/ActivityCard';
import TourCard from './supplier/TourCard';
import PackageCard from './supplier/PackageCard';

import './Booking.css'; // Our updated CSS

ChartJS.register(...registerables);

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SupplierBookingPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState({});
  const [bookingData, setBookingData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [salesData, setSalesData] = useState([]);

  // Offers
  const [offers, setOffers] = useState({
    activity_offers: [],
    package_offers: [],
    tour_offers: []
  });

  // Bookings
  const [activityBookings, setActivityBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [tourBookings, setTourBookings] = useState([]);

  // Filter
  const [filter, setFilter] = useState('all');

  // Tabs
  const [tabValue, setTabValue] = useState(0);

  // ---------------------------
  // Data Fetching
  // ---------------------------
  const fetchAllData = async () => {
    try {
      const [
        activitiesResponse,
        packagesResponse,
        toursResponse,
        dashboardResponse
      ] = await Promise.all([
        api.get('/api/supplier/bookings/'),
        api.get('/api/supplier/packagesb/'),
        api.get('/api/supplier/toursb/'),
        api.get('/api/supplier-dashboard/')
      ]);

      setActivityBookings(activitiesResponse.data || []);
      setPackageBookings(packagesResponse.data || []);
      setTourBookings(toursResponse.data || []);
      setDashboardData(dashboardResponse.data || {});

      const [bookingsPerMonth, customersPerMonth, salesPerMonth] = await Promise.all([
        api.get('/api/supplier/bookings-per-month/'),
        api.get('/api/supplier/customers-per-month/'),
        api.get('/api/supplier/sales-per-month/')
      ]);

      setBookingData(bookingsPerMonth.data || []);
      setCustomerData(customersPerMonth.data || []);
      setSalesData(salesPerMonth.data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await api.get('/api/supplier-offers/');
      setOffers(response.data);
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    fetchOffers();
    fetchAllData();
  }, []);

  // ---------------------------
  // Confirm Booking
  // ---------------------------
  const handleConfirm = async (type, bookingId) => {
    try {
      let endpoint = '';
      if (type === 'activity') {
        endpoint = `/api/supplier/bookings/${bookingId}/confirm/`;
      } else if (type === 'package') {
        endpoint = `/api/supplier/package/${bookingId}/confirm/`;
      } else if (type === 'tour') {
        endpoint = `/api/supplier/tour/${bookingId}/confirm/`;
      }
      await api.post(endpoint);
      await fetchAllData();
    } catch (err) {
      setError(err);
    }
  };

  // ---------------------------
  // Filter Logic
  // ---------------------------
  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const filterBookings = (bookings = []) => {
    if (filter === 'all') return bookings;
    return bookings.filter((booking) => {
      if (filter === 'paid') return booking.paid;
      if (filter === 'unpaid') return !booking.paid;
      if (filter === 'confirmed') return booking.confirmed;
      if (filter === 'unconfirmed') return !booking.confirmed;
      return true;
    });
  };

  // ---------------------------
  // Render Bookings Table
  // ---------------------------
  const renderBookingsTable = (bookings = [], typeLabel) => {
    const filtered = filterBookings(bookings);

    if (!filtered.length) {
      return (
        <Typography className="table-no-bookings">
          No bookings available
        </Typography>
      );
    }

    return (
      <div className="table-responsive">
        <TableContainer component={Paper} className="bookings-table-container">
          <Table className="responsive-table">
            <TableHead>
              <TableRow>
                <TableCell className="table-header">Title</TableCell>
                <TableCell className="table-header">Offer</TableCell>
                <TableCell className="table-header">Day</TableCell>
                <TableCell className="table-header">Time</TableCell>
                <TableCell className="table-header">Price</TableCell>
                <TableCell className="table-header">Status</TableCell>
                <TableCell className="table-header">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((booking) => {
                const imageUrl =
                  booking.period?.activity_offer?.activity?.image ||
                  booking.tourday?.tour_offer?.tour?.image ||
                  booking.package_offer?.package?.image;

                const title =
                  booking.period?.activity_offer?.activity?.title ||
                  booking.tourday?.tour_offer?.tour?.title ||
                  booking.package_offer?.package?.title ||
                  'Booking';

                const offerTitle =
                  booking.period?.activity_offer?.title ||
                  booking.tourday?.tour_offer?.title ||
                  booking.package_offer?.title ||
                  'Offer';

                const price =
                  (booking.period?.activity_offer?.price ||
                    booking.tourday?.tour_offer?.price ||
                    booking.package_offer?.price ||
                    0) * booking.quantity;

                const day =
                  booking.period?.day ||
                  booking.tourday?.day ||
                  booking.start_date;

                const startTime =
                  booking.period?.time_from ||
                  booking.tourday?.tour_offer?.tour?.pickup_time ||
                  booking.start_date;

                const endTime =
                  booking.period?.time_to ||
                  booking.tourday?.tour_offer?.tour?.dropoff_time ||
                  booking.end_date;

                const confirmedStatus = booking.confirmed ? 'Confirmed' : 'Unconfirmed';
                const bookingStatusColor = booking.confirmed ? '#27ae60' : '#e74c3c';

                return (
                  <TableRow key={booking.id} className="booking-table-row">
                    <TableCell>
                      <div className="table-title-cell">
                        {imageUrl && (
                          <img
                            src={`http://localhost:8000/${imageUrl}`}
                            alt="thumbnail"
                            className="table-thumb"
                          />
                        )}
                        <span className="table-title">{title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {offerTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {day}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {startTime} - {endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        ${price}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ color: bookingStatusColor, fontWeight: 600 }}
                      >
                        {confirmedStatus}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {!booking.confirmed && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleConfirm(typeLabel, booking.id)}
                          sx={{
                            backgroundColor: '#3498db',
                            color: '#fff',
                            textTransform: 'none',
                            ':hover': {
                              backgroundColor: '#2980b9'
                            }
                          }}
                        >
                          Confirm
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  // ---------------------------
  // Tab Handling
  // ---------------------------
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // ---------------------------
  // Rendering
  // ---------------------------
  if (loading) {
    return (
      <Container className="fancy-container">
        <CircularProgress className="fancy-loading" />
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="fancy-container">
        <Alert severity="error" className="fancy-error">
          Error loading data: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container className="fancy-container">
        {/* Tabs */}
        <Box className="wp-tabs-wrapper">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Supplier Dashboard Tabs"
            className="wp-tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" />
            <Tab label="Stats" />
            <Tab label="Offers" />
            <Tab label="Bookings" />
          </Tabs>
        </Box>

        {/* Overview */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} className="summary-grid">
            <Grid item xs={12} md={6}>
              <Card className="summary-card">
                <CardContent>
                  <div className="summary-card-header">
                    <FaCalendarTimes className="summary-icon" />
                    <Typography variant="h6" className="summary-title">
                      Unconfirmed Bookings
                    </Typography>
                  </div>
                  <Typography variant="h4" className="summary-number">
                    {dashboardData.unconfirmed_bookings || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Bookings awaiting confirmation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card className="summary-card">
                <CardContent>
                  <div className="summary-card-header">
                    <FaUsers className="summary-icon" />
                    <Typography variant="h6" className="summary-title">
                      Today's Customers
                    </Typography>
                  </div>
                  {dashboardData.todays_customers &&
                  dashboardData.todays_customers.length > 0 ? (
                    <List sx={{ marginTop: '10px' }}>
                      {dashboardData.todays_customers.map((customer, index) => (
                        <ListItem key={index} className="today-customer-listitem">
                          <ListItemAvatar>
                            <Tooltip title="Customer">
                              <Avatar sx={{ backgroundColor: '#2c3e50', color: '#fff' }}>
                                {customer[0]?.charAt(0)?.toUpperCase() || 'C'}
                              </Avatar>
                            </Tooltip>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {customer[0]}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span" color="textPrimary">
                                  {customer[1]}
                                </Typography>
                                <br />
                                <Typography variant="body2" component="span">
                                  {customer[2]}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography className="fancy-no-customers">
                      No customers today.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Stats */}
        <TabPanel value={tabValue} index={1}>
          {/* 3 charts in a row */}
          <div className="fancy-charts-grid">
            {/* Bookings Chart */}
            <Card className="fancy-chart-card">
              <CardContent>
                <Typography className="fancy-chart-title" sx={{ textAlign: 'center' }}>
                  <FaTasks className="fancy-chart-icon" /> Bookings Per Month
                </Typography>
                <Line
                  data={{
                    labels: [
                      'January','February','March','April','May','June',
                      'July','August','September','October','November','December'
                    ],
                    datasets: [
                      {
                        label: 'Bookings per Month',
                        data: bookingData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.2)'
                      }
                    ]
                  }}
                  className="fancy-chart"
                />
              </CardContent>
            </Card>

            {/* Customers Chart */}
            <Card className="fancy-chart-card">
              <CardContent>
                <Typography className="fancy-chart-title" sx={{ textAlign: 'center' }}>
                  <FaUserFriends className="fancy-chart-icon" /> Customers Per Month
                </Typography>
                <Line
                  data={{
                    labels: [
                      'January','February','March','April','May','June',
                      'July','August','September','October','November','December'
                    ],
                    datasets: [
                      {
                        label: 'Customers per Month',
                        data: customerData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)'
                      }
                    ]
                  }}
                  className="fancy-chart"
                />
              </CardContent>
            </Card>

            {/* Sales Chart */}
            <Card className="fancy-chart-card">
              <CardContent>
                <Typography className="fancy-chart-title" sx={{ textAlign: 'center' }}>
                  <FaMoneyBillWave className="fancy-chart-icon" /> Sales Per Month
                </Typography>
                <Line
                  data={{
                    labels: [
                      'January','February','March','April','May','June',
                      'July','August','September','October','November','December'
                    ],
                    datasets: [
                      {
                        label: 'Sales per Month',
                        data: salesData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)'
                      }
                    ]
                  }}
                  className="fancy-chart"
                />
              </CardContent>
            </Card>
          </div>
        </TabPanel>

        {/* Offers */}
        <TabPanel value={tabValue} index={2}>

          {/* Activities Section */}
          <div className="fancy-offers-section">
            {/* The title has a unique background and is centered */}
            <Typography
              variant="h5"
              className="offers-header offers-header-activities"
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              <FaBiking className="offers-section-icon" /> Activities
            </Typography>
            {offers.activity_offers.length > 0 ? (
              <div className="offers-gallery">
                {offers.activity_offers.map((offer) => (
                  <div className="offers-gallery-item" key={offer.id}>
                    <ActivityCard activity={offer} />
                  </div>
                ))}
              </div>
            ) : (
              <Typography className="offers-no-items">
                No activity offers available
              </Typography>
            )}
          </div>

          {/* Packages Section */}
          <div className="fancy-offers-section">
            <Typography
              variant="h5"
              className="offers-header offers-header-packages"
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              <FaSuitcaseRolling className="offers-section-icon" /> Packages
            </Typography>
            {offers.package_offers.length > 0 ? (
              <div className="offers-gallery">
                {offers.package_offers.map((offer) => (
                  <div className="offers-gallery-item" key={offer.id}>
                    <PackageCard pkg={offer} />
                  </div>
                ))}
              </div>
            ) : (
              <Typography className="offers-no-items">
                No package offers available
              </Typography>
            )}
          </div>

          {/* Tours Section */}
          <div className="fancy-offers-section">
            <Typography
              variant="h5"
              className="offers-header offers-header-tours"
              gutterBottom
              sx={{ textAlign: 'center' }}
            >
              <FaRouteIcon className="offers-section-icon" /> Tours
            </Typography>
            {offers.tour_offers.length > 0 ? (
              <div className="offers-gallery">
                {offers.tour_offers.map((offer) => (
                  <div className="offers-gallery-item" key={offer.id}>
                    <TourCard tour={offer} />
                  </div>
                ))}
              </div>
            ) : (
              <Typography className="offers-no-items">
                No tour offers available
              </Typography>
            )}
          </div>
        </TabPanel>

        {/* Bookings */}
        <TabPanel value={tabValue} index={3}>
          <div className="bookings-filter">
            <FormControl variant="outlined" className="fancy-filter-control">
              <InputLabel>Filter</InputLabel>
              <Select
                value={filter}
                onChange={handleFilterChange}
                label="Filter"
                className="fancy-filter-select"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="unpaid">Unpaid</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="unconfirmed">Unconfirmed</MenuItem>
              </Select>
            </FormControl>
          </div>

          <Divider sx={{ margin: '24px 0' }} />

          {/* Activity Bookings Table */}
          <Typography variant="h6" className="bookings-subtitle">
            <FaTasks style={{ marginRight: 6 }} />
            Activity Bookings
          </Typography>
          {renderBookingsTable(activityBookings, 'activity')}

          <Divider sx={{ margin: '24px 0' }} />

          {/* Package Bookings Table */}
          <Typography variant="h6" className="bookings-subtitle">
            <FaBoxes style={{ marginRight: 6 }} />
            Package Bookings
          </Typography>
          {renderBookingsTable(packageBookings, 'package')}

          <Divider sx={{ margin: '24px 0' }} />

          {/* Tour Bookings Table */}
          <Typography variant="h6" className="bookings-subtitle">
            <FaRoute style={{ marginRight: 6 }} />
            Tour Bookings
          </Typography>
          {renderBookingsTable(tourBookings, 'tour')}
        </TabPanel>
      </Container>
    </LocalizationProvider>
  );
};

export default SupplierBookingPage;
