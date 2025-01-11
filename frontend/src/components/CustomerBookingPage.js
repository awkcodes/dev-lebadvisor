import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // for programmatic navigation
import {
  Container,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Box
} from '@mui/material';
import {
  FaBookmark,
  FaHistory,
  FaExclamationTriangle,
  FaDollarSign,
  FaShoppingCart,
  FaCalendarAlt,
  FaClock,
  FaCheck,
  FaTimes,
  FaQrcode
} from 'react-icons/fa';

import api, { MainUrl } from '../services/api';
import './CustomerBookingPage.css'; // The improved stacked design CSS

const CustomerBookingPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bookings from your three endpoints
  const [activityBookings, setActivityBookings] = useState([]);
  const [packageBookings, setPackageBookings] = useState([]);
  const [tourBookings, setTourBookings] = useState([]);

  const today = new Date();
  const isBookingStillValid = (bookingDay) => new Date(bookingDay) >= today;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Activity, Package, Tour bookings
        const [actRes, pkgRes, tourRes] = await Promise.all([
          api.get('/api/customer/bookings/'),
          api.get('/api/customer/packagesb/'),
          api.get('/api/customer/toursb/')
        ]);
        setActivityBookings(actRes.data || []);
        setPackageBookings(pkgRes.data || []);
        setTourBookings(tourRes.data || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Filter logic to separate bookings into main/history/expired
  const filterBookings = (bookings, getDate, getPaid, getConfirmed) => {
    const main = bookings.filter((b) => !getPaid(b) && isBookingStillValid(getDate(b)));
    const history = bookings.filter((b) => getConfirmed(b) && getPaid(b));
    const expired = bookings.filter(
      (b) => !getConfirmed(b) && !getPaid(b) && !isBookingStillValid(getDate(b))
    );
    return { main, history, expired };
  };

  // Activity bookings: use b.period.day as date
  const activityData = filterBookings(
    activityBookings,
    (b) => b.period.day,
    (b) => b.paid,
    (b) => b.confirmed
  );
  // Package: typically use b.end_date as date
  const packageData = filterBookings(
    packageBookings,
    (b) => b.end_date,
    (b) => b.paid,
    (b) => b.confirmed
  );
  // Tour: use b.tourday.day as date
  const tourData = filterBookings(
    tourBookings,
    (b) => b.tourday.day,
    (b) => b.paid,
    (b) => b.confirmed
  );

  // Merge them: main, history, expired
  const combinedBookings = {
    main: [...activityData.main, ...packageData.main, ...tourData.main],
    history: [...activityData.history, ...packageData.history, ...tourData.history],
    expired: [...activityData.expired, ...packageData.expired, ...tourData.expired]
  };

  // Dynamically navigate to the correct offer details page
  const handleOfferClick = (booking) => {
    const actId = booking.period?.activity_offer?.activity?.id;
    const pkgId = booking.package_offer?.package?.id;
    const tourId = booking.tourday?.tour_offer?.tour?.id;

    if (actId) {
      navigate(`/activity-details/${actId}`);
    } else if (pkgId) {
      navigate(`/package-details/${pkgId}`);
    } else if (tourId) {
      navigate(`/tour-details/${tourId}`);
    } else {
      console.warn('Could not determine booking type for:', booking.id);
    }
  };

  // Renders each booking in a stacked card layout
  const renderStackedBookings = (bookings) => {
    if (!bookings.length) {
      return (
        <Typography className="no-bookings-stacked">
          No bookings available
        </Typography>
      );
    }

    return bookings.map((booking) => {
      // Common fields
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

      // Price & Quantity
      const price = booking.price || 0;
      const quantity = booking.quantity || 1;

      // The 'day' field
      const day =
        booking.period?.day ||
        booking.tourday?.day ||
        booking.start_date; // fallback if needed

      // For the start/end time:
      // Activities: use booking.period.time_from / booking.period.time_to
      // Tours: use booking.tourday.tour_offer.tour.pickup_time / .dropoff_time
      // Packages: typically no "time" for a single day, so fallback to booking.start_date / booking.end_date
      let startTime, endTime;
      if (booking.period) {
        // It's an activity
        startTime = booking.period.time_from;
        endTime = booking.period.time_to;
      } else if (booking.tourday) {
        // It's a tour
        startTime = booking.tourday.tour_offer?.tour?.pickup_time;   // use pickup_time
        endTime = booking.tourday.tour_offer?.tour?.dropoff_time;    // use dropoff_time
      } else if (booking.package_offer) {
        // It's a package
        startTime = booking.start_date;
        endTime = booking.end_date;
      } else {
        // fallback
        startTime = booking.start_date;
        endTime = booking.end_date;
      }

      // Paid or Not
      const paidElem = booking.paid ? (
        <span className="badge-paid">
          <FaCheck className="icon-inline" />
          Paid
        </span>
      ) : (
        <span className="badge-unpaid">
          <FaTimes className="icon-inline" />
          Unpaid
        </span>
      );

      // Confirmed or Not
      const confirmedElem = booking.confirmed ? (
        <span className="badge-confirmed">
          <FaCheck className="icon-inline" />
          Confirmed
        </span>
      ) : (
        <span className="badge-not-confirmed">
          <FaTimes className="icon-inline" />
          Not Confirmed
        </span>
      );

      // Possibly show QR code
      let qrElem = <span className="no-qr">N/A</span>;
      if (booking.confirmed && booking.qr_code) {
        qrElem = (
          <div className="qr-code-stacked">
            <FaQrcode className="icon-inline" />
            <img
              src={`${MainUrl}${booking.qr_code}`}
              alt="QR Code"
              className="qr-image"
            />
          </div>
        );
      }

      return (
        <Card
          key={booking.id}
          className="stacked-booking-card"
          onClick={() => handleOfferClick(booking)}
        >
          <CardContent>
            {/* Title */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                Title:
              </Typography>
              <Typography variant="body2" className="stacked-title clickable">
                {title}
              </Typography>
            </Box>

            {/* Offer */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                Offer:
              </Typography>
              <Typography variant="body2">{offerTitle}</Typography>
            </Box>

            {/* Price */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                <FaDollarSign className="icon-inline" /> Price:
              </Typography>
              <Typography variant="body2">${price}</Typography>
            </Box>

            {/* Quantity */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                <FaShoppingCart className="icon-inline" /> Quantity:
              </Typography>
              <Typography variant="body2">{quantity}</Typography>
            </Box>

            {/* Day */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                <FaCalendarAlt className="icon-inline" /> Day:
              </Typography>
              <Typography variant="body2">{day}</Typography>
            </Box>

            {/* Start Time */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                <FaClock className="icon-inline" /> Starts:
              </Typography>
              <Typography variant="body2">{startTime?.toString()}</Typography>
            </Box>

            {/* End Time */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                <FaClock className="icon-inline" /> Ends:
              </Typography>
              <Typography variant="body2">{endTime?.toString()}</Typography>
            </Box>

            {/* Paid */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                Paid:
              </Typography>
              {paidElem}
            </Box>

            {/* Confirmed */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                Confirmed:
              </Typography>
              {confirmedElem}
            </Box>

            {/* QR Code */}
            <Box className="stacked-row">
              <Typography variant="subtitle2" className="stacked-label">
                QR Code:
              </Typography>
              {qrElem}
            </Box>
          </CardContent>
        </Card>
      );
    });
  };

  if (loading) {
    return (
      <Container className="stacked-container">
        <CircularProgress className="stacked-loading" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="stacked-container">
        <Alert severity="error" className="stacked-error">
          Error loading bookings: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="stacked-container">
      <Grid container spacing={4} direction="column">
        {/* Active Bookings */}
        <Grid item>
          <Card className="stacked-section-card fancy-hover">
            <CardHeader
              className="stacked-section-header"
              title={
                <span className="section-title">
                  <FaBookmark className="icon-inline" /> Active Bookings
                </span>
              }
            />
            <CardContent>
              {renderStackedBookings(combinedBookings.main)}
            </CardContent>
          </Card>
        </Grid>

        {/* History */}
        <Grid item>
          <Card className="stacked-section-card fancy-hover">
            <CardHeader
              className="stacked-section-header"
              title={
                <span className="section-title">
                  <FaHistory className="icon-inline" /> History Bookings
                </span>
              }
            />
            <CardContent>
              {renderStackedBookings(combinedBookings.history)}
            </CardContent>
          </Card>
        </Grid>

        {/* Expired */}
        <Grid item>
          <Card className="stacked-section-card fancy-hover">
            <CardHeader
              className="stacked-section-header"
              title={
                <span className="section-title">
                  <FaExclamationTriangle className="icon-inline" /> Expired Bookings
                </span>
              }
            />
            <CardContent>
              {renderStackedBookings(combinedBookings.expired)}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerBookingPage;
