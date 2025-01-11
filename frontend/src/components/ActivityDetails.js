import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Snackbar,
  Alert,
  Button,
  TextField,
  MenuItem,
  Rating
} from "@mui/material";
import api, { MainUrl } from "../services/api";
import "./Details.css"; // IMPORTANT: ensures your new CSS is applied
import CustomDatePicker from "./booking/CustomDatePicker";
import PeriodsDropdown from "./booking/PeriodsDropdown";
import ImageCatalog from "./ImageCatalog";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaDollarSign,
  FaExclamationCircle,
  FaArrowDown,
  FaHeart,
  FaCheckCircle,
  FaTimesCircle
} from "react-icons/fa";

const ActivityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [offers, setOffers] = useState([]);
  const [imageLinks, setImageLinks] = useState([]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const [isFavorite, setIsFavorite] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  // For Reviews
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState("");

  const ACTIVITY_CONTENT_TYPE_ID = 11; // Adjust to your actual ID
  const loggedInUser = localStorage.getItem("username");

  // 1) Fetch Activity + favorite + offers
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const resp = await api.get(`/api/activity/${id}/`);
        setActivity(resp.data);

        const links = resp.data.catalogs.map((c) => `${MainUrl}${c.image}`);
        setImageLinks(links);

        if (loggedInUser) { // Only fetch favorite if user is logged in
          const favResp = await api.get(`/api/favorite-activity/${id}/`);
          setIsFavorite(favResp.data.is_favorite);
        }

        const offersResp = await api.get(`/api/activity/${id}/offers/`);
        setOffers(offersResp.data);
      } catch (error) {
        console.error("Failed to fetch activity details", error);
      }
    };
    fetchActivity();
  }, [id, loggedInUser]);

  // 2) Fetch Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get(
          `/api/reviews/?content_type=${ACTIVITY_CONTENT_TYPE_ID}&object_id=${id}`
        );
        const reviewsData = response.data.results || response.data;
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
        setReviews([]);
      }
    };
    fetchReviews();
  }, [id]);

  // 3) Calculate total price on quantity/period change
  useEffect(() => {
    if (selectedPeriod) {
      const price = parseFloat(selectedPeriod.activity_offer.price);
      setTotalPrice(price * quantity);
    }
  }, [quantity, selectedPeriod]);

  // Booking
  const handleBooking = async () => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }

    try {
      const data = { period_id: selectedPeriod.id, quantity };
      const response = await api.post("/api/bookingactivity/", data);
      if (response.data) {
        navigate("/");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error booking:", error);
      alert("Error booking");
    }
  };

  // Favorite
  const toggleFavorite = async () => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }
    try {
      if (isFavorite) {
        await api.delete(`/api/favorite-activity/${id}/`);
      } else {
        await api.post(`/api/favorite-activity/${id}/`);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite status", error);
    }
  };

  const handleDateChange = (date) => {
    // Removed login check to allow all users to select a date
    setSelectedDate(date);
    // Reset offer and period when date changes
    setSelectedOffer(null);
    setSelectedPeriod(null);
    setQuantity(1);
    setTotalPrice(0);
  };

  const handleOfferChange = (event) => {
    const offerId = parseInt(event.target.value, 10);
    const offer = offers.find((o) => o.id === offerId);
    setSelectedOffer(offer);
    setSelectedPeriod(null);
    setQuantity(1);
    setTotalPrice(0);
  };

  const toggleFaq = () => {
    const faqContent = document.querySelector(".faq-content");
    faqContent.classList.toggle("show");
  };

  // Submit new review
  const handleReviewSubmit = async () => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }
    try {
      const data = {
        content_type: ACTIVITY_CONTENT_TYPE_ID,
        object_id: parseInt(id, 10),
        rating: userRating,
        text: userReviewText
      };
      await api.post("/api/reviews/", data);

      // Clear
      setUserRating(0);
      setUserReviewText("");

      // Refresh list
      const response = await api.get(
        `/api/reviews/?content_type=${ACTIVITY_CONTENT_TYPE_ID}&object_id=${id}`
      );
      const reviewsData = response.data.results || response.data;
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review");
    }
  };

  if (!activity) return <div>Loading...</div>;

  return (
    <div className="details-box">
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

      <div
        className="background-blur"
        style={{ backgroundImage: `url(${MainUrl}/${activity.image})` }}
      >
        <div className="gradient-overlay"></div>
      </div>

      <div className="details-container">
        <div className="details-header">
          <h1 className="details-title">{activity.title}</h1>
          {loggedInUser && (
            <FaHeart
              className={`favorite-icon ${isFavorite ? "favorite" : ""}`}
              onClick={toggleFavorite}
            />
          )}
          {!loggedInUser && (
            <FaHeart
              className={`favorite-icon ${isFavorite ? "favorite" : ""}`}
              onClick={() => setLoginPrompt(true)}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
        <img
          src={`${MainUrl}/${activity.image}`}
          alt={activity.title}
          className="details-image"
        />
        <ImageCatalog imageLinks={imageLinks} />

        <div className="booking-offer">
          <h2 className="booking-form-title">Book This Activity Now!</h2>
          <CustomDatePicker
            from={new Date().toISOString().split("T")[0]}
            to={activity.available_to}
            daysOff={activity.days_off || ""}
            onDateChange={handleDateChange}
          />
          {selectedDate && (
            <>
              <TextField
                select
                label="Select Offer"
                value={selectedOffer?.id || ""}
                onChange={handleOfferChange}
                fullWidth
              >
                <MenuItem value="">Select Offer</MenuItem>
                {offers.map((offer) => (
                  <MenuItem key={offer.id} value={offer.id}>
                    {offer.title} - ${offer.price}
                  </MenuItem>
                ))}
              </TextField>
              {selectedOffer && (
                <PeriodsDropdown
                  selectedDate={selectedDate}
                  offerId={selectedOffer.id}
                  selectedPeriod={selectedPeriod}
                  setSelectedPeriod={setSelectedPeriod}
                />
              )}
            </>
          )}
          {selectedPeriod && (
            <>
              <TextField
                label="Quantity"
                type="number"
                InputProps={{
                  inputProps: { min: 1, max: selectedPeriod.stock }
                }}
                value={quantity}
                onChange={(e) => {
                  const val = Math.max(
                    1,
                    Math.min(selectedPeriod.stock, Number(e.target.value))
                  );
                  setQuantity(val);
                }}
                variant="outlined"
                margin="normal"
              />
              <p>
                <strong>Total Price:</strong> ${totalPrice.toFixed(2)}
              </p>
              <Button
                onClick={handleBooking}
                variant="contained"
                sx={{
                  backgroundColor: loggedInUser ? "#1781a1" : "#ccc",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: loggedInUser ? "#ff7a2d" : "#ccc"
                  }
                }}
                disabled={!loggedInUser}
              >
                {loggedInUser ? "BOOK NOW" : "Log in to Book"}
              </Button>
            </>
          )}
        </div>

        <div className="details-content">
          <p className="description">
            <FaExclamationCircle className="icon" /> {activity.description}
          </p>
          <p>
            <FaDollarSign className="icon" /> <strong>Price:</strong>{" "}
            {activity.price}
          </p>
          <div className="date-info">
            <p>
              <FaCalendarAlt className="icon" />{" "}
              <strong>Available from:</strong> {activity.available_from}
            </p>
            <p>
              <FaCalendarAlt className="icon" /> <strong>to:</strong>{" "}
              {activity.available_to}
            </p>
          </div>
          <p>
            <FaMapMarkerAlt className="icon" /> <strong>Location:</strong>{" "}
            {activity.location.name}
          </p>
          <p>
            <FaClock className="icon" /> <strong>Start time:</strong>{" "}
            {activity.start_time}
          </p>
          <p>
            <FaClock className="icon" /> <strong>End time:</strong>{" "}
            {activity.end_time}
          </p>
          <div className="included-excluded-container">
            <div className="included-excluded-card">
              <p>
                <strong>Included:</strong>
              </p>
              <ul>
                {activity.included_items.map((item) => (
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
                {activity.excluded_items.map((item) => (
                  <li key={item.id} className="excluded-item">
                    <FaTimesCircle className="icon" /> {item.Exclude}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="cancellation-policy">
            <FaExclamationCircle className="icon" />{" "}
            <strong>Cancellation policy:</strong> {activity.cancellation_policy}
          </p>
          <p>
            <FaUsers className="icon" /> <strong>Group size:</strong>{" "}
            {activity.group_size}
          </p>
          <p>
            <FaUsers className="icon" /> <strong>Participant age range:</strong>{" "}
            {activity.participant_age_range}
          </p>
          <p className="map-container">
            <FaMapMarkerAlt className="icon" /> <strong>Activity location:</strong>
            <div
              style={{ borderLeft: "6px solid orange" }}
              dangerouslySetInnerHTML={{ __html: activity.map }}
            />
          </p>
          <div className="faq-container">
            <p className="faq-title" onClick={toggleFaq}>
              FAQs <FaArrowDown className="faq-arrow" />
            </p>
            <div className="faq-content">
              {activity.faqs.map((faq) => (
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
                  <strong className="review-username-vibrant">
                    {rev.username}
                  </strong>
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
              name="activity-rating"
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

export default ActivityDetails;
