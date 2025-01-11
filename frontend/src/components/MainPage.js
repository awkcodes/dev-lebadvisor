import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SearchBar from './SearchBar';
import Card from './Card';
import './MainPage.css';

import { FaRoute, FaSuitcaseRolling, FaBiking } from 'react-icons/fa';

const MainPage = () => {
  const [featured, setFeatured] = useState([]);
  const [familyPicks, setFamilyPicks] = useState([]);
  const [seasonalHighlights, setSeasonalHighlights] = useState([]);
  const [localFavorites, setLocalFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, familyRes, seasonalRes, localRes] = await Promise.all([
          api.get('/api/featured-items/'),
          api.get('/api/family-picks/'),
          api.get('/api/seasonal-highlights/'),
          api.get('/api/local-favorites/'),
        ]);
        setFeatured(featuredRes.data);
        setFamilyPicks(familyRes.data);
        setSeasonalHighlights(seasonalRes.data);
        setLocalFavorites(localRes.data);
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      }
    };
    fetchData();
  }, []);

  const handleCardClick = (id, type) => {
    navigate(`/${type}-details/${id}`);
  };

  return (
    <div className="main-page">
      {/* Banner */}
      <div className="banner">
        <div className="banner-bg-layer"></div>
        <div className="banner-bg-layer2"></div>
        <div className="banner-bg-layer3"></div>
        <div className="banner-content">
          <h1 className="banner-title">Welcome to LebAdvisor</h1>
          <p className="banner-subtitle">Your Ultimate Lebanon Travel Companion</p>
          <button className="banner-button" onClick={() => navigate('/about-us')}>
            About Us
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <SearchBar />
      </div>

      {/* Navigation Cards */}
      <div className="navigation-cards">
        <div className="nav-card" onClick={() => navigate('/all-tours/')}>
          <FaRoute className="nav-icon" />
          <h3>Tours</h3>
        </div>
        <div className="nav-card" onClick={() => navigate('/all-packages/')}>
          <FaSuitcaseRolling className="nav-icon" />
          <h3>Packages</h3>
        </div>
        <div className="nav-card" onClick={() => navigate('/all-activities/')}>
          <FaBiking className="nav-icon" />
          <h3>Activities</h3>
        </div>
      </div>

      {/* Featured Section */}
      <section className="section section-featured">
        <h2 className="section-title">Featured</h2>
        <div className="section-bg"></div>
        <div className="scrollable-row">
          {featured.activities?.map((activity) => (
            <Card key={activity.id} item={activity} onClick={() => handleCardClick(activity.id, 'activity')} />
          ))}
          {featured.packages?.map((pkg) => (
            <Card key={pkg.id} item={pkg} onClick={() => handleCardClick(pkg.id, 'package')} />
          ))}
          {featured.tours?.map((tour) => (
            <Card key={tour.id} item={tour} onClick={() => handleCardClick(tour.id, 'tour')} />
          ))}
        </div>
      </section>

      {/* Family Picks Section */}
      <section className="section section-family-picks">
        <h2 className="section-title">Family Picks</h2>
        <div className="section-bg"></div>
        <div className="scrollable-row">
          {familyPicks.activities?.map((activity) => (
            <Card key={activity.id} item={activity} onClick={() => handleCardClick(activity.id, 'activity')} />
          ))}
          {familyPicks.packages?.map((pkg) => (
            <Card key={pkg.id} item={pkg} onClick={() => handleCardClick(pkg.id, 'package')} />
          ))}
          {familyPicks.tours?.map((tour) => (
            <Card key={tour.id} item={tour} onClick={() => handleCardClick(tour.id, 'tour')} />
          ))}
        </div>
      </section>

      {/* Seasonal Highlights Section */}
      <section className="section section-seasonal-highlights">
        <h2 className="section-title">Seasonal Highlights</h2>
        <div className="section-bg"></div>
        <div className="scrollable-row">
          {seasonalHighlights.activities?.map((activity) => (
            <Card key={activity.id} item={activity} onClick={() => handleCardClick(activity.id, 'activity')} />
          ))}
          {seasonalHighlights.packages?.map((pkg) => (
            <Card key={pkg.id} item={pkg} onClick={() => handleCardClick(pkg.id, 'package')} />
          ))}
          {seasonalHighlights.tours?.map((tour) => (
            <Card key={tour.id} item={tour} onClick={() => handleCardClick(tour.id, 'tour')} />
          ))}
        </div>
      </section>

      {/* Local Favorites Section */}
      <section className="section section-local-favorites">
        <h2 className="section-title">Local Favorites</h2>
        <div className="section-bg"></div>
        <div className="scrollable-row">
          {localFavorites.activities?.map((activity) => (
            <Card key={activity.id} item={activity} onClick={() => handleCardClick(activity.id, 'activity')} />
          ))}
          {localFavorites.packages?.map((pkg) => (
            <Card key={pkg.id} item={pkg} onClick={() => handleCardClick(pkg.id, 'package')} />
          ))}
          {localFavorites.tours?.map((tour) => (
            <Card key={tour.id} item={tour} onClick={() => handleCardClick(tour.id, 'tour')} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainPage;
