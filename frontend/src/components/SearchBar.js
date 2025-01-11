import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from '../services/api.js';
import Card from './Card';
import './SearchBar.css';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const response = await api.get(`/api/search?query=${encodeURIComponent(query)}`);
      if (response.status === 200) {
        setSearchResults(response.data);
      }
    } catch (error) {
      console.error('Error during search:', error);
    }
  };

  const handleCardClick = (id, type) => {
    navigate(`/${type}-details/${id}`);
  };

  return (
    <div className="search-container">
      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder="Search for tours, activities, and packages..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search-button" onClick={handleSearch}>
          <FaSearch className="search-icon" />
        </button>
      </div>
      {searchResults && (
        <div className="search-results">
          {searchResults.activities && searchResults.activities.map(activity => (
            <Card key={activity.id} item={activity} onClick={() => handleCardClick(activity.id, 'activity')} />
          ))}
          {searchResults.packages && searchResults.packages.map(pkg => (
            <Card key={pkg.id} item={pkg} onClick={() => handleCardClick(pkg.id, 'package')} />
          ))}
          {searchResults.tours && searchResults.tours.map(tour => (
            <Card key={tour.id} item={tour} onClick={() => handleCardClick(tour.id, 'tour')} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
