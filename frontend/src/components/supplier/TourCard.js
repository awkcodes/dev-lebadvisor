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
import TourDatePicker from '../booking/TourDatePicker';
import './CardStyles.css';

const TourCard = ({ tour }) => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [availableTourDays, setAvailableTourDays] = useState([]);
  const [selectedTourDay, setSelectedTourDay] = useState(null);

  const [stockToReserve, setStockToReserve] = useState(0);
  const [stockToAdd, setStockToAdd] = useState(0);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleOfferChange = async (event) => {
    const offerId = event.target.value;
    const offer = tour.offers.find((o) => o.id === parseInt(offerId));
    setSelectedOffer(offer);
    setSelectedTourDay(null);
    setAvailableTourDays([]);
    setStockToReserve(0);
    setStockToAdd(0);
    setSuccessMessage(null);
    setError(null);

    if (offer) {
      try {
        const response = await api.get(`/api/tourdays/${offer.id}/`);
        setAvailableTourDays(response.data);
      } catch (err) {
        console.error('Failed to fetch tour days', err);
        setError('Failed to load tour days. Please try again later.');
      }
    }
  };

  const handleDateChange = (date) => {
    const tourDay = availableTourDays.find((d) => d.day === date);
    setSelectedTourDay(tourDay);
    setStockToReserve(0);
    setStockToAdd(0);
    setSuccessMessage(null);
    setError(null);
  };

  const handleReserve = async (blockAll = false) => {
    if (!selectedOffer || !selectedTourDay) {
      setError('Please select an offer and a date first.');
      return;
    }
    const qty = blockAll ? selectedTourDay.stock : Number(stockToReserve);
    if (qty <= 0) {
      setError('Reservation quantity must be greater than 0.');
      return;
    }
    try {
      await api.post('/api/reserve-tour/', {
        tour_offer: selectedOffer.id,
        tour_day: selectedTourDay.id,
        number_of_reservations: qty
      });
      setSuccessMessage(
        blockAll ? 'Day blocked successfully!' : 'Reservation successful!'
      );
      setError(null);
    } catch (err) {
      console.error('Error reserving stock', err);
      setError('Error reserving stock. Please try again.');
    }
  };

  const handleAddStock = async () => {
    if (!selectedTourDay) {
      setError('Please select a date first.');
      return;
    }
    const addQty = Number(stockToAdd);
    if (addQty <= 0) {
      setError('The stock to add must be greater than 0.');
      return;
    }
    try {
      await api.post('/api/add-tour-day-stock/', {
        tour_day_id: selectedTourDay.id,
        number_of_stocks: addQty
      });
      setSuccessMessage(`Successfully added ${addQty} stock to the selected day.`);
      setError(null);
      setStockToAdd(0);

      // Refresh the days
      const response = await api.get(`/api/tourdays/${selectedOffer.id}/`);
      setAvailableTourDays(response.data);
    } catch (err) {
      console.error('Error adding stock to tour day', err);
      setError('Error adding stock. Please try again.');
    }
  };

  return (
    <Card className="supplier-card">
      {tour.image && (
        <div className="supplier-card-image-container">
          <img
            src={`http://localhost:8000${tour.image}`}
            alt={tour.title}
            className="supplier-card-image"
          />
        </div>
      )}

      <CardContent className="supplier-card-content">
        <Typography variant="h6" className="supplier-card-title">
          {tour.title}
        </Typography>

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
          {tour.offers.map((offer) => (
            <MenuItem key={offer.id} value={offer.id}>
              {offer.title}
            </MenuItem>
          ))}
        </TextField>

        {selectedOffer && (
          <>
            <TourDatePicker
              availableTourDays={availableTourDays.map((day) => day.day)}
              onDateChange={handleDateChange}
            />

            {selectedTourDay && (
              <>
                {/* Show available stock */}
                <Typography variant="body2" sx={{ marginTop: 2 }}>
                  <strong>Available Stock: </strong> {selectedTourDay.stock}
                </Typography>

                {/* Stock to Reserve */}
                <TextField
                  label="Stock to Reserve"
                  type="number"
                  value={stockToReserve}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    // Cap the input at selectedTourDay.stock
                    if (val > selectedTourDay.stock) {
                      setStockToReserve(selectedTourDay.stock);
                    } else {
                      setStockToReserve(val);
                    }
                  }}
                  inputProps={{
                    min: 0,
                    max: selectedTourDay.stock
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
                    sx={{ marginRight: 1 }}
                  >
                    Reserve Stock
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleReserve(true)}
                  >
                    Block Day (All)
                  </Button>
                </div>

                {/* Add Stock */}
                <TextField
                  label="Stock to Add"
                  type="number"
                  value={stockToAdd}
                  onChange={(e) => {
                    const val = Number(e.target.value);
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
                  sx={{ marginTop: 1 }}
                >
                  Add Stock
                </Button>
              </>
            )}
          </>
        )}

        {successMessage && (
          <Typography variant="body2" className="supplier-card-success" sx={{ marginTop: 2 }}>
            {successMessage}
          </Typography>
        )}
        {error && (
          <Typography variant="body2" className="supplier-card-error" sx={{ marginTop: 2 }}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TourCard;
