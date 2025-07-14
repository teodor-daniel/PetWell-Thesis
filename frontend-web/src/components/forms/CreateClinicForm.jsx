import {
  Button,
  Group,
  Loader,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Paper,
  Title
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useCallback, useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const apiKey   = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const API_BASE = process.env.REACT_APP_API_URL;

const libraries = ['places', 'geocoding'];

const GREEN = '#7bc71e';

export default function CreateClinicForm({ onClose }) {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    city: '',
    latitude: 44.4268,
    longitude: 26.1025,
  });
  const [saving, setSaving] = useState(false);
  const [geocodingError, setGeocodingError] = useState('');
  const [error, setError] = useState('');

  const onChange = (field) => (val) => setForm((prevForm) => ({ ...prevForm, [field]: val }));

  const getAddressFromLatLng = useCallback(async (lat, lng) => {
    setGeocodingError('');
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.error("Google Maps Geocoder not loaded yet.");
      setGeocodingError("Geocoder service not available.");
      return;
    }
    const geocoder = new window.google.maps.Geocoder();
    try {
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results[0]) {
        const result = response.results[0];
        const addressComponents = result.address_components;
        let streetAddress = result.formatted_address;
        let city = '';
        const cityComponent = addressComponents.find(comp => comp.types.includes('locality'));
        if (cityComponent) {
          city = cityComponent.long_name;
        } else {
          const adminAreaLevel1 = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'));
          if (adminAreaLevel1) city = adminAreaLevel1.long_name;
        }
        const streetNumber = addressComponents.find(comp => comp.types.includes('street_number'))?.long_name;
        const route = addressComponents.find(comp => comp.types.includes('route'))?.long_name;
        if (route) {
            streetAddress = streetNumber ? `${route}, ${streetNumber}` : route;
        }
        setForm((prevForm) => ({
          ...prevForm,
          address: streetAddress,
          city: city,
          latitude: lat,
          longitude: lng,
        }));
      } else {
        console.warn("Geocoder failed due to: No results found");
        setGeocodingError("Could not find address for this location.");
      }
    } catch (error) {
      console.error("Geocoder failed due to: " + error);
      setGeocodingError("Failed to fetch address. Please try again.");
    }
  }, []);

  const markerPos = { lat: form.latitude, lng: form.longitude };

  const onMapClick = useCallback((e) => {
    const lat = +e.latLng.lat().toFixed(6);
    const lng = +e.latLng.lng().toFixed(6);
    setForm((prevForm) => ({
        ...prevForm,
        latitude: lat,
        longitude: lng,
    }));
    getAddressFromLatLng(lat, lng);
  }, [getAddressFromLatLng]);

  const submit = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/clinics/mine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed response:", errorText);
          let errorMessage = `HTTP error! status: ${res.status}`;
          try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch (e) {}
          setError(errorMessage);
          showNotification({ message: errorMessage, color: 'red' });
          return;
      }
      showNotification({ message: 'Clinic created', color: 'green' });
      if (typeof onClose === 'function') {
        onClose();
      } else {
        console.warn("onClose prop is not a function or was not provided.");
      }
    } catch (err) {
      setError(err.message || 'Failed to create clinic');
      console.error("Submit error:", err);
      showNotification({ message: err.message || 'Failed to create clinic', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      radius="lg"
      withBorder
      p="lg"
      style={{
        background: 'transparent',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      <Stack gap="md">
        <Title order={4} fw={600} style={{ color: GREEN, textAlign: 'center' }}>
          Create New Clinic
        </Title>
        <TextInput
          label={<span style={{ fontWeight: 600, color: GREEN }}>Name</span>}
          value={form.name}
          onChange={e => onChange('name')(e.currentTarget.value)}
          required
          styles={{
            input: {
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(123, 199, 30, 0.2)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: GREEN,
                backgroundColor: 'rgba(255,255,255,0.95)',
                transform: 'scale(1.02)'
              }
            }
          }}
        />
        <TextInput
          label={<span style={{ fontWeight: 600, color: GREEN }}>Address</span>}
          value={form.address}
          onChange={e => onChange('address')(e.currentTarget.value)}
          required
          styles={{
            input: {
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(123, 199, 30, 0.2)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: GREEN,
                backgroundColor: 'rgba(255,255,255,0.95)',
                transform: 'scale(1.02)'
              }
            }
          }}
        />
        <TextInput
          label={<span style={{ fontWeight: 600, color: GREEN }}>Phone</span>}
          value={form.phone}
          onChange={e => onChange('phone')(e.currentTarget.value)}
          required
          styles={{
            input: {
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(123, 199, 30, 0.2)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: GREEN,
                backgroundColor: 'rgba(255,255,255,0.95)',
                transform: 'scale(1.02)'
              }
            }
          }}
        />
        <TextInput
          label={<span style={{ fontWeight: 600, color: GREEN }}>Email</span>}
          type="email"
          value={form.email}
          onChange={e => onChange('email')(e.currentTarget.value)}
          required
          styles={{
            input: {
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(123, 199, 30, 0.2)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: GREEN,
                backgroundColor: 'rgba(255,255,255,0.95)',
                transform: 'scale(1.02)'
              }
            }
          }}
        />
        <TextInput
          label={<span style={{ fontWeight: 600, color: GREEN }}>City</span>}
          value={form.city}
          onChange={e => onChange('city')(e.currentTarget.value)}
          required
          styles={{
            input: {
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(123, 199, 30, 0.2)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: GREEN,
                backgroundColor: 'rgba(255,255,255,0.95)',
                transform: 'scale(1.02)'
              }
            }
          }}
        />
        <Group grow>
          <NumberInput
            label={<span style={{ fontWeight: 600, color: GREEN }}>Lat</span>}
            value={form.latitude}
            precision={6}
            disabled
            readOnly
            styles={{
              input: {
                backgroundColor: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(123, 199, 30, 0.2)',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: GREEN,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  transform: 'scale(1.02)'
                }
              }
            }}
          />
          <NumberInput
            label={<span style={{ fontWeight: 600, color: GREEN }}>Lng</span>}
            value={form.longitude}
            precision={6}
            disabled
            readOnly
            styles={{
              input: {
                backgroundColor: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(123, 199, 30, 0.2)',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: GREEN,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  transform: 'scale(1.02)'
                }
              }
            }}
          />
        </Group>
        {apiKey ? (
          <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: 300 }}
              center={markerPos}
              zoom={7}
              onClick={onMapClick}
              options={{ streetViewControl: false, mapTypeControl: false }}
            >
              <Marker position={markerPos} />
            </GoogleMap>
            <small>Click anywhere in Romania → marker moves → coordinates fill in automatically.</small>
            {geocodingError && <Text color="red" size="sm" mt="xs">{geocodingError}</Text>}
          </LoadScript>
        ) : (
          <Loader />
        )}
        {error && <Text color="red">{error}</Text>}
        <Button
          loading={saving}
          onClick={submit}
          fullWidth
          size="md"
          radius="xl"
          style={{
            fontWeight: 700,
            boxShadow: "0 2px 8px rgba(123, 199, 30, 0.15)",
            paddingLeft: 24,
            paddingRight: 24,
            transition: "box-shadow 0.2s, background 0.2s",
            backgroundColor: GREEN,
            '&:hover': {
              backgroundColor: '#6ab017'
            }
          }}
        >
          Save clinic
        </Button>
      </Stack>
    </Paper>
  );
}