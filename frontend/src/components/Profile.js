import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Collapse,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClipboardList,
  FaPhone,
  FaLock,
} from 'react-icons/fa';
import './Profile.css';
import api from '../services/api';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [showAllPreferences, setShowAllPreferences] = useState(false);

  const [showEmailChange, setShowEmailChange] = useState(false);
  const [showPhoneChange, setShowPhoneChange] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Fetch user data
    api.get('/users/user/')
      .then((response) => {
        const data = response.data;
        setUserData(data);

        if (data.user?.is_supplier) {
          setSelectedLocations([data.profile.location?.id || []]);
        } else {
          setSelectedLocations(Array.isArray(data.profile.location) ? data.profile.location.map((loc) => loc.id) : []);
          setSelectedPreferences(Array.isArray(data.profile.preferences) ? data.profile.preferences.map((pref) => pref.id) : []);
        }

        setEmail(data.user?.email || '');
        setPhone(data.user?.phone || '');
      })
      .catch((error) => {
        setErrorMessage('Failed to load user data.');
      });

    // Fetch locations and preferences
    api.get('/api/locations').then((response) => {
      setLocations(Array.isArray(response.data) ? response.data : []);
    });

    api.get('/api/categories').then((response) => {
      setPreferences(Array.isArray(response.data) ? response.data : []);
    });
  }, []);

  const handleLocationChange = (e) => {
    const id = parseInt(e.target.value);
    const updatedLocations = e.target.checked
      ? [...selectedLocations, id]
      : selectedLocations.filter((loc) => loc !== id);
    setSelectedLocations(updatedLocations);
    api.put('/users/update-customer-locations/', { location: updatedLocations })
      .then(() => setSuccessMessage('Locations updated successfully.'))
      .catch(() => setErrorMessage('Failed to update locations.'));
  };

  const handlePreferenceChange = (e) => {
    const id = parseInt(e.target.value);
    const updatedPreferences = e.target.checked
      ? [...selectedPreferences, id]
      : selectedPreferences.filter((pref) => pref !== id);
    setSelectedPreferences(updatedPreferences);
    api.put('/users/update-customer-preferences/', { preferences: updatedPreferences })
      .then(() => setSuccessMessage('Preferences updated successfully.'))
      .catch(() => setErrorMessage('Failed to update preferences.'));
  };

  const handleEmailChange = () => {
    api.put('/users/update-email/', { email })
      .then(() => setSuccessMessage('Email updated successfully.'))
      .catch(() => setErrorMessage('Failed to update email.'));
  };

  const handlePhoneChange = () => {
    api.put('/users/update-phone/', { phone })
      .then(() => setSuccessMessage('Phone number updated successfully.'))
      .catch(() => setErrorMessage('Failed to update phone number.'));
  };

  const handlePasswordChange = () => {
    api.put('/users/update-password/', { old_password: oldPassword, new_password: newPassword })
      .then(() => setSuccessMessage('Password updated successfully.'))
      .catch((error) => {
        setErrorMessage(
          error.response?.data?.old_password
            ? 'Old password is incorrect.'
            : 'Failed to update password.'
        );
      });
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Add a loading check to ensure data is loaded before rendering
  if (!userData) return <div>Loading...</div>;

  return (
    <Container className="profile-container">
      <Snackbar
        open={!!successMessage || !!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={successMessage ? 'success' : 'error'} sx={{ width: '100%' }}>
          {successMessage || errorMessage}
        </Alert>
      </Snackbar>
      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <Card className="profile-card">
            <CardContent>
              <Typography variant="h6">
                <FaUser className="icon" /> Account Information
              </Typography>
              <Typography>
                <FaUser className="icon-inline" /> Username: {userData.user?.username}
              </Typography>
              <Typography>
                <FaEnvelope className="icon-inline" /> Email: {userData.user?.email}
              </Typography>
              <Typography>
                <FaPhone className="icon-inline" /> Phone: {userData.user?.phone}
              </Typography>
              <Button
                onClick={() => setShowEmailChange(!showEmailChange)}
                variant="contained"
                color="primary"
                style={{ marginTop: 20, marginBottom: 20 }}
              >
                {showEmailChange ? 'Hide' : 'Change Email'}
              </Button>
              <Collapse in={showEmailChange}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />
                <Button onClick={handleEmailChange} variant="contained" color="primary">
                  Update Email
                </Button>
              </Collapse>
              <Button
                onClick={() => setShowPhoneChange(!showPhoneChange)}
                variant="contained"
                color="primary"
                style={{ marginTop: 20, marginBottom: 20 }}
              >
                {showPhoneChange ? 'Hide' : 'Change Phone'}
              </Button>
              <Collapse in={showPhoneChange}>
                <TextField
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />
                <Button onClick={handlePhoneChange} variant="contained" color="primary">
                  Update Phone
                </Button>
              </Collapse>
              <Button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                variant="contained"
                color="primary"
                style={{ marginTop: 20, marginBottom: 20 }}
              >
                {showPasswordChange ? 'Hide' : 'Change Password'}
              </Button>
              <Collapse in={showPasswordChange}>
                <TextField
                  label="Old Password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />
                <TextField
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                />
                <Button onClick={handlePasswordChange} variant="contained" color="primary">
                  Change Password
                </Button>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card className="profile-card">
            <CardContent>
              <Typography variant="h6">
                <FaMapMarkerAlt className="icon" /> {userData.user?.is_supplier ? 'Location' : 'Locations'}
              </Typography>
              {userData.user?.is_supplier ? (
                <FormControl fullWidth variant="outlined" margin="normal">
                  <InputLabel>Select Location</InputLabel>
                  <Select
                    value={selectedLocations[0]}
                    onChange={(e) => {
                      const location = parseInt(e.target.value);
                      setSelectedLocations([location]);
                      api.put('/users/update-supplier-location/', { location })
                        .then(() => setSuccessMessage('Location updated successfully.'))
                        .catch(() => setErrorMessage('Failed to update location.'));
                    }}
                    label="Select Location"
                  >
                    {Array.isArray(locations) && locations.map((location) => (
                      <MenuItem key={location.id} value={location.id}>
                        {location.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <FormControl component="fieldset" margin="normal">
                  <FormLabel component="legend">Select Locations</FormLabel>
                  <FormGroup>
                    {Array.isArray(locations) && locations.slice(0, showAllLocations ? locations.length : 5).map((location) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedLocations.includes(location.id)}
                            onChange={handleLocationChange}
                            value={location.id}
                          />
                        }
                        label={location.name}
                        key={location.id}
                      />
                    ))}
                  </FormGroup>
                  {locations.length > 5 && (
                    <Button onClick={() => setShowAllLocations(!showAllLocations)}>
                      {showAllLocations ? 'Show Less' : 'Show More'}
                    </Button>
                  )}
                </FormControl>
              )}
            </CardContent>
          </Card>
        </Grid>

        {!userData.user?.is_supplier && (
          <Grid item xs={12}>
            <Card className="profile-card">
              <CardContent>
                <Typography variant="h6">
                  <FaClipboardList className="icon" /> Preferences
                </Typography>
                <FormControl component="fieldset" margin="normal">
                  <FormLabel component="legend">Select Preferences</FormLabel>
                  <FormGroup>
                    {Array.isArray(preferences) && preferences.slice(0, showAllPreferences ? preferences.length : 5).map((preference) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedPreferences.includes(preference.id)}
                            onChange={handlePreferenceChange}
                            value={preference.id}
                          />
                        }
                        label={preference.name}
                        key={preference.id}
                      />
                    ))}
                  </FormGroup>
                  {preferences.length > 5 && (
                    <Button onClick={() => setShowAllPreferences(!showAllPreferences)}>
                      {showAllPreferences ? 'Show Less' : 'Show More'}
                    </Button>
                  )}
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Profile;
