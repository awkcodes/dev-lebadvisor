import React, { useEffect, useState } from "react";
import { Button, TextField, MenuItem, Snackbar, Alert, Rating } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api, { MainUrl } from "../services/api";
import { format } from "date-fns";
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
import PackageDatePicker from "./booking/PackageDatePicker";
import "./Details.css"; // ensure CSS is applied

const PACKAGE_CONTENT_TYPE_ID = 32; // Adjust as needed

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("username");

  const [pkg, setPkg] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedPackageDay, setSelectedPackageDay] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLinks, setImageLinks] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [availableDates, setAvailableDates] = useState([]);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // REVIEWS
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userReviewText, setUserReviewText] = useState("");

  // 1) Fetch Package + favorite
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await api.get(`/api/package/${id}/`);
        setPkg(response.data);

        const links = response.data.catalogs.map((c) => `${MainUrl}${c.image}`);
        setImageLinks(links);

        const favoriteResponse = await api.get(`/api/favorite-package/${id}/`);
        setIsFavorite(favoriteResponse.data.is_favorite);
      } catch (error) {
        console.error("Failed to fetch package details", error);
      }
    };
    fetchPackage();
  }, [id]);

  // 2) Fetch Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(
          `/api/reviews/?content_type=${PACKAGE_CONTENT_TYPE_ID}&object_id=${id}`
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

  // 3) If selected offer, fetch package days
  useEffect(() => {
    if (selectedOffer) {
      const fetchPackageDays = async () => {
        try {
          const response = await api.get(`/api/packagedays/${selectedOffer.id}/`);
          setAvailableDates(response.data);
        } catch (error) {
          console.error("Failed to fetch package days", error);
        }
      };
      fetchPackageDays();
    }
  }, [selectedOffer]);

  // 4) Recalc total price
  useEffect(() => {
    if (selectedPackageDay) {
      const price = parseFloat(selectedPackageDay.package_offer.price);
      setTotalPrice(price * quantity);
    }
  }, [quantity, selectedPackageDay]);

  const handleBooking = async () => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }

    try {
      if (selectedPackageDay) {
        if (selectedPackageDay.stock >= quantity) {
          await api.post("/api/bookingpackage/", {
            package_offer_id: selectedPackageDay.package_offer.id,
            start_date: selectedPackageDay.day,
            quantity
          });
          navigate("/bookings/");
          window.location.reload();
        } else {
          setErrorMessage("Not enough stock available for the selected date.");
        }
      } else {
        setErrorMessage("Selected date is not available.");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(
        error.response?.data?.error || "An error occurred during booking."
      );
    }
  };

  const toggleFavorite = async () => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }
    try {
      if (isFavorite) {
        await api.delete(`/api/favorite-package/${id}/`);
      } else {
        await api.post(`/api/favorite-package/${id}/`);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite status", error);
    }
  };

  const handleOfferChange = (event) => {
    const offerId = parseInt(event.target.value, 10);
    const offer = pkg.offers.find((o) => o.id === offerId);
    setSelectedOffer(offer);
    setSelectedPackageDay(null);
    setAvailableDates([]);
  };

  const handleDateChange = (date) => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }
    const packageDay = availableDates.find(
      (day) => format(new Date(day.day), "yyyy-MM-dd") === date
    );
    setSelectedPackageDay(packageDay);
    setQuantity(1);
  };

  const toggleFaq = () => {
    const faqContent = document.querySelector(".faq-content");
    faqContent.classList.toggle("show");
  };

  const toggleItinerary = (index) => {
    const itineraryContent = document.querySelectorAll(".itinerary-content")[index];
    itineraryContent.classList.toggle("show");
  };

  // Submit new review
  const handleReviewSubmit = async () => {
    if (!loggedInUser) {
      setLoginPrompt(true);
      return;
    }
    try {
      const data = {
        content_type: PACKAGE_CONTENT_TYPE_ID,
        object_id: parseInt(id, 10),
        rating: userRating,
        text: userReviewText
      };
      await api.post("/api/reviews/", data);

      // Clear fields
      setUserRating(0);
      setUserReviewText("");

      // Refresh
      const res = await api.get(
        `/api/reviews/?content_type=${PACKAGE_CONTENT_TYPE_ID}&object_id=${id}`
      );
      const newData = res.data.results || res.data;
      setReviews(Array.isArray(newData) ? newData : []);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Error submitting review");
    }
  };

  if (!pkg) return <div>Loading...</div>;

  return (
    <div
      className="details-box"
      style={{ backgroundImage: `url(${MainUrl}/${pkg.image})` }}
    >
      <Snackbar
        open={!!errorMessage || loginPrompt}
        autoHideDuration={6000}
        onClose={() => {
          setErrorMessage("");
          setLoginPrompt(false);
        }}
      >
        <Alert
          onClose={() => {
            setErrorMessage("");
            setLoginPrompt(false);
          }}
          severity={loginPrompt ? "warning" : "error"}
          sx={{ width: "100%" }}
        >
          {loginPrompt ? "Please log in to continue." : errorMessage}
        </Alert>
      </Snackbar>

      <div className="gradient-overlay"></div>
      <div className="details-container">
        <div className="details-header">
          <h1 className="details-title">{pkg.title}</h1>
          <FaHeart
            className={`favorite-icon ${isFavorite ? "favorite" : ""}`}
            onClick={toggleFavorite}
          />
        </div>
        <img
          src={`${MainUrl}/${pkg.image}`}
          alt={pkg.title}
          className="details-image"
        />
        <hr />
        <ImageCatalog imageLinks={imageLinks} />

        <div className="booking-offer">
          <h2 className="booking-form-title">Book This Package Now!</h2>
          <TextField
            select
            label="Select Offer"
            value={selectedOffer?.id || ""}
            onChange={handleOfferChange}
            fullWidth
          >
            <MenuItem value="">Select Offer</MenuItem>
            {pkg.offers.map((offer) => (
              <MenuItem key={offer.id} value={offer.id}>
                {offer.title} - ${offer.price}
              </MenuItem>
            ))}
          </TextField>
          {selectedOffer && (
            <PackageDatePicker
              availablePackageDays={availableDates.map((day) =>
                format(new Date(day.day), "yyyy-MM-dd")
              )}
              onDateChange={handleDateChange}
            />
          )}
          {selectedPackageDay && selectedPackageDay.package_offer && (
            <>
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.min(
                      Math.max(parseInt(e.target.value, 10), 1),
                      selectedPackageDay.stock
                    )
                  )
                }
                InputProps={{
                  inputProps: { min: 1, max: selectedPackageDay.stock }
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
          <p className="description">{pkg.description}</p>
          <p>
            <FaDollarSign className="icon" /> <strong>Starting Price:</strong>{" "}
            ${pkg.offers[0].price}
          </p>
          <div className="date-info">
            <p>
              <FaCalendarAlt className="icon" /> <strong>Available from:</strong>{" "}
              {pkg.available_from}
            </p>
            <p>
              <FaCalendarAlt className="icon" /> <strong>to:</strong>{" "}
              {pkg.available_to}
            </p>
          </div>
          <p>
            <FaClock className="icon" /> <strong>Pickup time:</strong>{" "}
            {pkg.pickup_time}
          </p>
          <p>
            <FaClock className="icon" /> <strong>Dropoff time:</strong>{" "}
            {pkg.dropoff_time}
          </p>
          <p>
            <FaCalendarAlt className="icon" /> <strong>Period:</strong>{" "}
            {pkg.period} days and {pkg.period - 1} nights
          </p>
          <div className="included-excluded-container">
            <div className="included-excluded-card">
              <p>
                <strong>Included:</strong>
              </p>
              <ul>
                {pkg.included_items.map((item) => (
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
                {pkg.excluded_items.map((item) => (
                  <li key={item.id} className="excluded-item">
                    <FaTimesCircle className="icon" /> {item.Exclude}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="cancellation-policy">
            <FaExclamationCircle className="icon" />{" "}
            <strong>Cancellation policy:</strong> {pkg.cancellation_policy}
          </p>
          <p>
            <FaVolumeUp className="icon" /> <strong>Languages:</strong>{" "}
            {pkg.languages}
          </p>
          <p>
            <FaUsers className="icon" /> <strong>Minimum age:</strong>{" "}
            {pkg.min_age}
          </p>
          <div className="itinerary-container">
            <p className="itinerary-title">
              Itinerary <FaListUl />
            </p>
            {pkg.itinerary.map((step, index) => (
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
            <FaMapMarkerAlt className="icon" /> <strong>Location:</strong>
            <div
              className="map-container"
              style={{ borderLeft: "6px solid orange" }}
              dangerouslySetInnerHTML={{ __html: pkg.pickup_location }}
            />
          </p>
          <div className="faq-container">
            <p className="faq-title" onClick={toggleFaq}>
              FAQs <FaArrowDown className="faq-arrow" />
            </p>
            <div className="faq-content">
              {pkg.faqs.map((faq) => (
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
              name="package-rating"
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

export default PackageDetails;
