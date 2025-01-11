import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Rating
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import api, { MainUrl } from "../services/api";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaDollarSign,
  FaExclamationCircle,
  FaArrowDown,
  FaVolumeUp,
  FaHeart,
  FaCheckCircle,
  FaTimesCircle,
  FaListUl
} from "react-icons/fa";
import ImageCatalog from "./ImageCatalog";
import TourDatePicker from "./booking/TourDatePicker";
import "./Details.css"; // apply new CSS

const TOUR_CONTENT_TYPE_ID = 24; // Adjust as needed

const TourDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("username");

  const [tour, setTour] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedTourDay, setSelectedTourDay] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLinks, setImageLinks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [availableDates, setAvailableDates] = useState([]);
  const [loginPrompt, setLoginPrompt] = useState(false);

  // REVIEWS
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState("");

  // 1) Fetch Tour + favorite
  useEffect(() => {
    const fetchTour = async () => {
      try {
        const response = await api.get(`/api/tour/${id}/`);
        setTour(response.data);

        const links = response.data.catalogs.map((c) => `${MainUrl}${c.image}`);
        setImageLinks(links);

        const favoriteResponse = await api.get(`/api/favorite-tour/${id}/`);
        setIsFavorite(favoriteResponse.data.is_favorite);
      } catch (error) {
        console.error("Failed to fetch tour details", error);
      }
    };
    fetchTour();
  }, [id]);

  // 2) Fetch Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(
          `/api/reviews/?content_type=${TOUR_CONTENT_TYPE_ID}&object_id=${id}`
        );
        const data = res.data.results || res.data;
        setReviews(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
        setReviews([]);
      }
    };
    fetchReviews();
  }, [id]);

  // 3) If an offer is selected, fetch Tour days
  useEffect(() => {
    if (selectedOffer) {
      const fetchTourDays = async () => {
        try {
          const response = await api.get(`/api/tourdays/${selectedOffer.id}/`);
          const available = response.data.map((day) => ({
            date: format(new Date(day.day), "yyyy-MM-dd"),
            ...day
          }));
          setAvailableDates(available);
        } catch (error) {
          console.error("Failed to fetch tour days", error);
        }
      };
      fetchTourDays();
    }
  }, [selectedOffer]);

  // 4) Recalc total price
  useEffect(() => {
    if (selectedTourDay) {
      const price = parseFloat(selectedTourDay.tour_offer.price);
      setTotalPrice(price * quantity);
    }
  }, [quantity, selectedTourDay]);

  const handleBooking = async () => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }

    try {
      if (selectedTourDay) {
        if (selectedTourDay.stock >= quantity) {
          await api.post("/api/bookingtour/", {
            tourday_id: selectedTourDay.id,
            quantity
          });
          navigate("/bookings/");
          window.location.reload();
        } else {
          console.log("Not enough stock available for the selected date.");
        }
      } else {
        console.log("Selected date is not available.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleFavorite = async () => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }
    try {
      if (isFavorite) {
        await api.delete(`/api/favorite-tour/${id}/`);
      } else {
        await api.post(`/api/favorite-tour/${id}/`);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite status", error);
    }
  };

  const toggleFaq = () => {
    const faqContent = document.querySelector(".faq-content");
    faqContent.classList.toggle("show");
  };

  const toggleItinerary = (index) => {
    const itineraryContent = document.querySelectorAll(".itinerary-content")[index];
    itineraryContent.classList.toggle("show");
  };

  const handleOfferChange = (event) => {
    const offerId = parseInt(event.target.value, 10);
    const offer = tour.offers.find((o) => o.id === offerId);
    setSelectedOffer(offer);
    setSelectedTourDay(null);
    setAvailableDates([]);
  };

  const handleDateChange = (date) => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }
    const td = availableDates.find((d) => d.date === date);
    setSelectedTourDay(td);
    setQuantity(1);
  };

  // Submit new review
  const handleReviewSubmit = async () => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }
    try {
      const data = {
        content_type: TOUR_CONTENT_TYPE_ID,
        object_id: parseInt(id, 10),
        rating: userRating,
        text: userReviewText
      };
      await api.post("/api/reviews/", data);

      // Clear
      setUserRating(0);
      setUserReviewText("");

      // Refresh
      const res = await api.get(
        `/api/reviews/?content_type=${TOUR_CONTENT_TYPE_ID}&object_id=${id}`
      );
      const newData = res.data.results || res.data;
      setReviews(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review");
    }
  };

  if (!tour) return <div>Loading...</div>;

  return (
    <div
      className="details-box"
      style={{ backgroundImage: `url(${MainUrl}/${tour.image})` }}
    >
      <Snackbar
        open={loginPrompt}
        autoHideDuration={6000}
        onClose={() => setLoginPrompt(false)}
      >
        <Alert
          onClose={() => setLoginPrompt(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          Please log in to continue.
        </Alert>
      </Snackbar>

      <div className="gradient-overlay"></div>
      <div className="details-container">
        <div className="details-header">
          <h1 className="details-title">{tour.title}</h1>
          <FaHeart
            className={`favorite-icon ${isFavorite ? "favorite" : ""}`}
            onClick={toggleFavorite}
          />
        </div>
        <img
          src={`${MainUrl}/${tour.image}`}
          alt={tour.title}
          className="details-image"
        />
        <hr />
        <ImageCatalog imageLinks={imageLinks} />
        <div className="booking-offer">
          <h2 className="booking-form-title">Book This Tour</h2>
          <TextField
            select
            label="Select Offer"
            value={selectedOffer?.id || ""}
            onChange={handleOfferChange}
            fullWidth
          >
            <MenuItem value="">Select Offer</MenuItem>
            {tour.offers.map((offer) => (
              <MenuItem key={offer.id} value={offer.id}>
                {offer.title} - ${offer.price}
              </MenuItem>
            ))}
          </TextField>
          {selectedOffer && (
            <TourDatePicker
              availableTourDays={availableDates.map((date) => date.date)}
              onDateChange={handleDateChange}
            />
          )}
          {selectedTourDay && (
            <>
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      Math.max(parseInt(e.target.value, 10), 1),
                      selectedTourDay.stock
                    )
                  )
                }
                InputProps={{
                  inputProps: { min: 1, max: selectedTourDay.stock }
                }}
                fullWidth
                margin="normal"
              />
              <p>
                <strong>Total Price:</strong> ${totalPrice.toFixed(2)}
              </p>
              <Button
                onClick={handleBooking}
                variant="contained"
                sx={{
                  backgroundColor: "#1781a1",
                  color: "#fff",
                  "&:hover": { backgroundColor: "#ff7a2d" }
                }}
              >
                BOOK NOW
              </Button>
            </>
          )}
        </div>
        <div className="details-content">
          <p className="description">{tour.description}</p>
          <p>
            <FaDollarSign className="icon" /> <strong>Price:</strong> {tour.price}
          </p>
          <div className="date-info">
            <p>
              <FaCalendarAlt className="icon" />{" "}
              <strong>Available from:</strong> {tour.available_from}
            </p>
            <p>
              <FaCalendarAlt className="icon" /> <strong>to:</strong>{" "}
              {tour.available_to}
            </p>
          </div>
          <p>
            <FaClock className="icon" /> <strong>Duration:</strong> {tour.period} hours
          </p>
          <div className="included-excluded-container">
            <div className="included-excluded-card">
              <p>
                <strong>Included:</strong>
              </p>
              <ul>
                {tour.included_items.map((item) => (
                  <li key={item.id} className="included-item">
                    <FaCheckCircle className="icon" /> {item.include}
                  </li>
                ))}
              </ul>
            </div>
            <div className="included-excluded-card">
              <p>
                <strong>Not included:</strong>
              </p>
              <ul>
                {tour.excluded_items.map((item) => (
                  <li key={item.id} className="excluded-item">
                    <FaTimesCircle className="icon" /> {item.Exclude}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="cancellation-policy">
            <FaExclamationCircle className="icon" />{" "}
            <strong>Cancellation policy:</strong> {tour.cancellation_policy}
          </p>
          <p>
            <FaVolumeUp className="icon" /> <strong>Languages:</strong>{" "}
            {tour.languages}
          </p>
          <p>
            <FaUsers className="icon" /> <strong>Minimum age:</strong>{" "}
            {tour.min_age}
          </p>
          <div className="itinerary-container">
            <p className="itinerary-title">
              Itinerary <FaListUl />
            </p>
            {tour.itinerary.map((step, index) => (
              <div key={step.id} className="itinerary-step">
                <p
                  className="itinerary-step-title"
                  onClick={() => toggleItinerary(index)}
                >
                  {step.title} <FaArrowDown className="itinerary-arrow" />
                </p>
                <div className="itinerary-content">
                  <p>{step.activity}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="map-container">
            <FaMapMarkerAlt className="icon" /> <strong>Pickup location:</strong>
            <div
              className="map-container"
              style={{ borderLeft: "6px solid orange" }}
              dangerouslySetInnerHTML={{ __html: tour.pickup_location }}
            />
          </p>
          <div className="faq-container">
            <p className="faq-title" onClick={toggleFaq}>
              FAQs <FaArrowDown className="faq-arrow" />
            </p>
            <div className="faq-content">
              {tour.faqs.map((faq) => (
                <div className="faq-item" key={faq.id}>
                  <p>
                    <strong>Q:</strong> {faq.question}
                  </p>
                  <p>
                    <strong>A:</strong> {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION (using vibrant classes) */}
        <div className="reviews-section-vibrant">
          <h3 className="reviews-title-vibrant">Reviews</h3>
          {Array.isArray(reviews) && reviews.length > 0 ? (
            reviews.map((rev) => (
              <div key={rev.id} className="single-review-vibrant">
                <div className="review-header-vibrant">
                  <strong className="review-username-vibrant">{rev.username}</strong>
                  <Rating
                    name="read-only"
                    value={rev.rating}
                    readOnly
                    size="small"
                    className="review-stars-vibrant"
                  />
                </div>
                <p className="review-text-vibrant">{rev.text}</p>
                <hr className="review-divider-vibrant" />
              </div>
            ))
          ) : (
            <p className="no-reviews-vibrant">No reviews yet</p>
          )}

          <h4 className="leave-review-title-vibrant">Leave a Review</h4>
          <div className="review-form-vibrant">
            <Rating
              name="tour-rating"
              value={userRating}
              onChange={(_, newValue) => setUserRating(newValue)}
              size="medium"
              className="leave-rating-vibrant"
            />
            <TextField
              label="Share your experience"
              multiline
              rows={4}
              value={userReviewText}
              onChange={(e) => setUserReviewText(e.target.value)}
              variant="outlined"
              className="review-textfield-vibrant"
            />
            <Button
              variant="contained"
              onClick={handleReviewSubmit}
              className="submit-review-btn-vibrant"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
