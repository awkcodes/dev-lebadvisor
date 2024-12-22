import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import Card from '../Card.js';
import "./CardGrid.css";
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

const AllPackages = () => {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [subLocations, setSubLocations] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [selectedSubLocations, setSelectedSubLocations] = useState([]);

  const [showAllCategories, setShowAllCategories] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgs, cats, locs, subsCats, subsLocs] = await Promise.all([
          api.get('/api/all-packages/'),
          api.get('/api/categories/'),
          api.get('/api/locations/'),
          api.get('/api/subcategories/'),     // for subcategories
          api.get('/api/sublocations/')       // for sublocations
        ]);

        setPackages(pkgs.data);
        setCategories(cats.data);
        setLocations(locs.data);
        setSubCategories(subsCats.data);
        setSubLocations(subsLocs.data);

        // default: all categories selected, "All" location (0)
        setSelectedCategories(cats.data.map(cat => cat.id));
        setSelectedLocation(0);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  const handleCardClick = (id) => {
    navigate(`/package-details/${id}`);
  };

  // toggle category
  const handleCategoryChange = (event) => {
    const catId = parseInt(event.target.value);
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
      // also remove any subcategories tied to this cat
      const filteredSubs = selectedSubCategories.filter(subId => {
        const sc = subCategories.find(x => x.id === subId);
        return sc && sc.category !== catId;
      });
      setSelectedSubCategories(filteredSubs);
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // toggle subcategory
  const handleSubCategoryChange = (subCatId) => {
    if (selectedSubCategories.includes(subCatId)) {
      setSelectedSubCategories(
        selectedSubCategories.filter(id => id !== subCatId)
      );
    } else {
      setSelectedSubCategories([...selectedSubCategories, subCatId]);
    }
  };

  // main location
  const handleLocationChange = (event) => {
    const locId = parseInt(event.target.value);
    setSelectedLocation(locId);
    setSelectedSubLocations([]); // reset subloc when location changes
  };

  // toggle sublocation
  const handleSubLocationChange = (subLocId) => {
    if (selectedSubLocations.includes(subLocId)) {
      setSelectedSubLocations(
        selectedSubLocations.filter(id => id !== subLocId)
      );
    } else {
      setSelectedSubLocations([...selectedSubLocations, subLocId]);
    }
  };

  const filteredPackages = packages.filter(pkg => {
    // categories
    if (
      selectedCategories.length > 0 &&
      !selectedCategories.some(catId => pkg.categories.includes(catId))
    ) {
      return false;
    }
    // subcategories
    if (
      selectedSubCategories.length > 0 &&
      !selectedSubCategories.some(subId => (pkg.sub_categories || []).includes(subId))
    ) {
      return false;
    }
    // location
    if (selectedLocation !== 0 && pkg.location.id !== selectedLocation) {
      return false;
    }
    // sublocations
    if (
      selectedSubLocations.length > 0 &&
      !selectedSubLocations.some(subId => (pkg.sub_locations || []).includes(subId))
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="all-container">
      <div className="filters">
        <h3>Filters</h3>

        {/* Categories */}
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

        {/* Subcategories for each chosen category */}
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

        {/* Location */}
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
        {filteredPackages.map(item => (
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

export default AllPackages;
