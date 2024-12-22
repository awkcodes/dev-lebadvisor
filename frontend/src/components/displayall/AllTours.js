import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import "./CardGrid.css";
import Card from '../Card.js';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';

const AllTours = () => {
  const [tours, setTours] = useState([]);

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  const [locations, setLocations] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [selectedSubLocations, setSelectedSubLocations] = useState([]);

  const [showAllCategories, setShowAllCategories] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetch all in parallel
        const [toursRes, catsRes, locsRes, subCatsRes, subLocsRes] = await Promise.all([
          api.get('/api/all-tours/'),
          api.get('/api/categories/'),
          api.get('/api/locations/'),
          api.get('/api/subcategories/'),   // subcategories
          api.get('/api/sublocations/')     // sublocations
        ]);

        setTours(toursRes.data);
        setCategories(catsRes.data);
        setLocations(locsRes.data);
        setSubCategories(subCatsRes.data);
        setSubLocations(subLocsRes.data);

        // default selections
        setSelectedCategories(catsRes.data.map(cat => cat.id)); 
        setSelectedLocation(0); 
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/tour-details/${id}`);
  };

  // Toggle main category
  const handleCategoryChange = (event) => {
    const catId = parseInt(event.target.value);
    if (selectedCategories.includes(catId)) {
      // remove category
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
      // remove any subcategories linked to that category
      const filteredSubs = selectedSubCategories.filter(subId => {
        const sc = subCategories.find(x => x.id === subId);
        return sc && sc.category !== catId;
      });
      setSelectedSubCategories(filteredSubs);
    } else {
      // add category
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Toggle subcategory
  const handleSubCategoryChange = (subCatId) => {
    if (selectedSubCategories.includes(subCatId)) {
      setSelectedSubCategories(selectedSubCategories.filter(id => id !== subCatId));
    } else {
      setSelectedSubCategories([...selectedSubCategories, subCatId]);
    }
  };

  // Toggle main location
  const handleLocationChange = (event) => {
    const locId = parseInt(event.target.value);
    setSelectedLocation(locId);
    // reset sublocations
    setSelectedSubLocations([]);
  };

  // Toggle sublocation
  const handleSubLocationChange = (subLocId) => {
    if (selectedSubLocations.includes(subLocId)) {
      setSelectedSubLocations(selectedSubLocations.filter(id => id !== subLocId));
    } else {
      setSelectedSubLocations([...selectedSubLocations, subLocId]);
    }
  };

  const filteredTours = tours.filter(item => {
    // categories
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.some(catId => item.categories.includes(catId))
    ) {
      return false;
    }

    // subcategories
    if (
      selectedSubCategories.length > 0 &&
      !selectedSubCategories.some(subId => (item.sub_categories || []).includes(subId))
    ) {
      return false;
    }

    // location
    if (selectedLocation !== 0 && item.location.id !== selectedLocation) {
      return false;
    }

    // sublocations
    if (
      selectedSubLocations.length > 0 &&
      !selectedSubLocations.some(subId => (item.sub_locations || []).includes(subId))
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="all-container">
      <div className="filters">
        <h3>Filters</h3>

        {/* Main Categories */}
        <div className="filter-group">
          <InputLabel>Categories</InputLabel>
          <FormGroup>
            {categories.slice(0, showAllCategories ? categories.length : 5).map(category => (
              <FormControlLabel
                key={category.id}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category.id)}
                    onChange={handleCategoryChange}
                    value={category.id}
                  />
                }
                label={category.name}
              />
            ))}
          </FormGroup>
          {categories.length > 5 && (
            <Button onClick={() => setShowAllCategories(!showAllCategories)}>
              {showAllCategories ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </div>

        {/* Subcategories per chosen category */}
        {selectedCategories.map(catId => {
          const relevantSubs = subCategories.filter(sc => sc.category === catId);
          if (!relevantSubs.length) return null;
          return (
            <div key={catId} className="filter-group">
              <InputLabel>
                Subcategories of {categories.find(c => c.id === catId)?.name}
              </InputLabel>
              <FormGroup>
                {relevantSubs.map(sc => (
                  <FormControlLabel
                    key={sc.id}
                    control={
                      <Checkbox
                        checked={selectedSubCategories.includes(sc.id)}
                        onChange={() => handleSubCategoryChange(sc.id)}
                      />
                    }
                    label={sc.name}
                  />
                ))}
              </FormGroup>
            </div>
          );
        })}

        {/* Main Location */}
        <div className="filter-group">
          <InputLabel>Location</InputLabel>
          <FormControl fullWidth>
            <Select value={selectedLocation} onChange={handleLocationChange}>
              <MenuItem value={0}>All Locations</MenuItem>
              {locations.map(location => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* Sublocations */}
        {selectedLocation !== 0 && (
          <div className="filter-group">
            <InputLabel>
              Sublocations of {locations.find(l => l.id === selectedLocation)?.name}
            </InputLabel>
            <FormGroup>
              {subLocations
                .filter(sub => sub.location === selectedLocation)
                .map(sub => (
                  <FormControlLabel
                    key={sub.id}
                    control={
                      <Checkbox
                        checked={selectedSubLocations.includes(sub.id)}
                        onChange={() => handleSubLocationChange(sub.id)}
                      />
                    }
                    label={sub.name}
                  />
                ))}
            </FormGroup>
          </div>
        )}
      </div>

      <div className="scrollable-row">
        {filteredTours.map(item => (
          <Card
            key={item.id}
            item={item}
            onClick={() => handleCardClick(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AllTours;
