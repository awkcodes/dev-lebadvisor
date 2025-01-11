import { MainUrl } from '../services/api';
import "./Card.css";
import { FaMapMarkerAlt, FaClock, FaDollarSign, FaStar } from 'react-icons/fa';

const Card = ({ item, onClick }) => {
  const fullStars = Math.floor(item.average_rating || 0); // Number of full stars
  const hasHalfStar = (item.average_rating || 0) % 1 >= 0.5; // Check for half star

  return (
    <div className="card" onClick={onClick}>
      <div className="card-image-wrapper">
        <img src={`${MainUrl}${item.image}`} alt={item.title} />
      </div>
      <div className="card-content">
        <h2>{item.title}</h2>

        {/* Average Rating and Review Count - Reflecting Actual Rating */}
        <div className="card-rating-row-inline">
          {/* Render full stars */}
          {[...Array(fullStars)].map((_, i) => (
            <FaStar key={`full-${i}`} className="card-icon star-icon filled-star" />
          ))}
          {/* Render half star if applicable */}
          {hasHalfStar && <FaStar className="card-icon star-icon half-star" />}
          {/* Render empty stars */}
          {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
            <FaStar key={`empty-${i}`} className="card-icon star-icon" />
          ))}
          <p className="card-rating-value">
            {item.average_rating?.toFixed(1) || 0} 
            <span className="card-reviews-count">({item.reviews_count} reviews)</span>
          </p>
        </div>

        <div className="card-details">
          <p className="card-location">
            <FaMapMarkerAlt className='card-icon' /> {item.location.name}
          </p>
          <p className="card-to">
            <FaClock className='card-icon' /> Available till {item.available_to}
          </p>
        </div>
        <div className="card-price">
          <FaDollarSign />
          {item.offers && item.offers.length > 0 ? item.offers[0].price : 'N/A'} <span>per {item.unit}</span>
        </div>
      </div>
    </div>
  );
};

export default Card;
