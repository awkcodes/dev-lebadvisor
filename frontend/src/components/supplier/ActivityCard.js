import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button
} from '@mui/material';
import api from '../../services/api';
import CustomDatePicker from '../booking/CustomDatePicker';
import PeriodsDropdown from '../booking/PeriodsDropdown';
import './CardStyles.css'; // New common CSS

const ActivityCard = ({ activity }) => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const [stockToReserve, setStockToReserve] = useState(0);
  const [stockToAdd, setStockToAdd] = useState(0);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ------------------------------------------------
  // 1) Handle Offer change
  // ------------------------------------------------
  const handleOfferChange = (event) => {
    const offerId = event.target.value;
    const offer = activity.offers.find((o) => o.id === parseInt(offerId));
    setSelectedOffer(offer);
    setSelectedDate(null);
    setPeriods([]);
    setSelectedPeriod(null);
    setStockToReserve(0);
    setStockToAdd(0);
    setSuccessMessage(null);
    setError(null);
  };

  // ------------------------------------------------
  // 2) Handle Date change
  // ------------------------------------------------
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedPeriod(null);
    setSuccessMessage(null);
    setError(null);
    setStockToReserve(0);
    setStockToAdd(0);

    if (selectedOffer && date) {
      try {
        setLoading(true);
        // fetch periods for that offer & date
        const response = await api.get(
          `/api/offer/${selectedOffer.id}/periods/${date}/`
        );
        setPeriods(response.data);
      } catch (err) {
        setError('Failed to fetch periods. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // ------------------------------------------------
  // 3) Reserve or Block single Period
  // ------------------------------------------------
  const handleReserve = async (blockAll = false) => {
    if (!selectedOffer || !selectedPeriod) {
      setError('Please select an offer, a date, and a period first.');
      return;
    }

    const qty = blockAll ? selectedPeriod.stock : Number(stockToReserve);
    if (qty <= 0) {
      setError('Reservation quantity must be greater than 0.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/api/reserve-activity/', {
        activity_offer: selectedOffer.id,
        period: selectedPeriod.id,
        number_of_reservations: qty
      });
      setSuccessMessage(
        blockAll
          ? 'All stock reserved (this single period blocked)!'
          : 'Stock reserved successfully!'
      );
      setError(null);
      setStockToReserve(0);

      // Refresh periods to reflect updated stock
      const res = await api.get(
        `/api/offer/${selectedOffer.id}/periods/${selectedDate}/`
      );
      setPeriods(res.data);
    } catch (err) {
      setError('Error reserving stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // 4) Add Stock to single Period
  // ------------------------------------------------
  const handleAddStock = async () => {
    if (!selectedPeriod) {
      setError('Please select a period first.');
      return;
    }
    const addQty = Number(stockToAdd);
    if (addQty <= 0) {
      setError('The stock to add must be greater than 0.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/api/add-period-stock/', {
        period: selectedPeriod.id,
        number_of_stocks: addQty
      });
      setSuccessMessage(`Successfully added ${addQty} stock.`);
      setError(null);
      setStockToAdd(0);

      // Refresh periods
      const res = await api.get(
        `/api/offer/${selectedOffer.id}/periods/${selectedDate}/`
      );
      setPeriods(res.data);
    } catch (err) {
      setError('Error adding stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // 5) Block Entire Day (all periods)
  // ------------------------------------------------
  const handleBlockEntireDay = async () => {
    if (!selectedOffer || !selectedDate) {
      setError('Please select an offer and a date first.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/api/block-activity-day/', {
        activity_id: activity.id, // block entire activity's day
        day: selectedDate
      });
      setSuccessMessage(`Successfully blocked all periods on ${selectedDate}.`);
      setError(null);
      setPeriods([]); // Clear out periods
    } catch (err) {
      setError('Error blocking the entire day. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------
  // 6) Render
  // ------------------------------------------------
  return (
    <Card className="supplier-card">
      {activity.image && (
        <div className="supplier-card-image-container">
          <img
            src={`http://localhost:8000${activity.image}`}
            alt={activity.title}
            className="supplier-card-image"
          />
        </div>
      )}
      <CardContent className="supplier-card-content">
        <Typography variant="h6" className="supplier-card-title">
          {activity.title}
        </Typography>

        {/* Offer dropdown */}
        <TextField
          select
          label="Select Offer"
          value={selectedOffer?.id || ''}
          onChange={handleOfferChange}
          fullWidth
          variant="outlined"
          sx={{ marginBottom: 2 }}
        >
          <MenuItem value="">Select Offer</MenuItem>
          {activity.offers.map((off) => (
            <MenuItem key={off.id} value={off.id}>
              {off.title}
            </MenuItem>
          ))}
        </TextField>

        {selectedOffer && (
          <>
            {/* Date Picker */}
            <CustomDatePicker
              from={activity.available_from}
              to={activity.available_to}
              daysOff={activity.days_off}
              onDateChange={handleDateChange}
            />

            {loading && (
              <Typography variant="body2" sx={{ marginTop: 1 }}>
                Loading periods...
              </Typography>
            )}

            {/* If date is selected, show "Block Entire Day" button */}
            {selectedDate && (
              <Button
                variant="contained"
                color="error"
                onClick={handleBlockEntireDay}
                sx={{ marginTop: 2 }}
              >
                Block Entire Day
              </Button>
            )}

            {/* If we have any periods on that date */}
            {selectedDate && !loading && periods.length > 0 && (
              <PeriodsDropdown
                selectedDate={selectedDate}
                offerId={selectedOffer.id}
                setSelectedPeriod={setSelectedPeriod}
                selectedPeriod={selectedPeriod}
              />
            )}
            {selectedDate && !loading && periods.length === 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                No available periods for the selected date (or day is blocked).
              </Typography>
            )}

            {/* If a specific period is chosen, show stock fields */}
            {selectedPeriod && (
              <>
                <Typography variant="body2" sx={{ marginTop: 2 }}>
                  <strong>Available Stock: </strong> {selectedPeriod.stock}
                </Typography>

                {/* Stock to Reserve */}
                <TextField
                  label="Stock to Reserve"
                  type="number"
                  value={stockToReserve}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > selectedPeriod.stock) {
                      // Cap the value to the max stock
                      setStockToReserve(selectedPeriod.stock);
                    } else {
                      setStockToReserve(val);
                    }
                  }}
                  inputProps={{
                    min: 0,
                    max: selectedPeriod.stock
                  }}
                  fullWidth
                  variant="outlined"
                  sx={{ marginTop: 2 }}
                />

                <div className="supplier-card-actions">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleReserve(false)}
                    disabled={loading}
                  >
                    Reserve Stock
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleReserve(true)}
                    disabled={loading}
                  >
                    Block Day (This Period)
                  </Button>
                </div>

                {/* Add Stock */}
                <TextField
                  label="Stock to Add"
                  type="number"
                  value={stockToAdd}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    // no max limit for adding, so just no negative
                    setStockToAdd(val < 0 ? 0 : val);
                  }}
                  fullWidth
                  variant="outlined"
                  sx={{ marginTop: 2 }}
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleAddStock}
                  disabled={loading}
                  sx={{ marginTop: 1 }}
                >
                  Add Stock
                </Button>
              </>
            )}
          </>
        )}

        {/* Result messages */}
        {successMessage && (
          <Typography variant="body2" color="green" sx={{ marginTop: 2 }}>
            {successMessage}
          </Typography>
        )}
        {error && (
          <Typography variant="body2" color="red" sx={{ marginTop: 2 }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
