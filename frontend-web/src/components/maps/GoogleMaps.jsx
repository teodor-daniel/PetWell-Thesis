import { Button, Loader, Slider, SegmentedControl } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  GoogleMap,
  InfoWindow,
  LoadScript, Marker,
} from '@react-google-maps/api';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const LIBRARIES = ['places'];
const API    = process.env.REACT_APP_API_URL;            
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const slugify = str => str.toLowerCase().trim()
  .replace(/[\s_]+/g, '-').replace(/[^\w-]/g, '');

export default function GoogleMaps({ visitedClinicIds = [], onBookAgain }) {
  const isMobile   = useMediaQuery('(max-width: 600px)');
  const [currentPos, setCurrentPos] = useState(null);
  const [clinics,    setClinics]    = useState([]);
  const [hoveredId,  setHoveredId]  = useState(null);
  const [radius, setRadius] = useState(5);
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();
  const clearTimer = useRef(null);                   


  useEffect(() => {
    if (!navigator.geolocation) {
      setCurrentPos({ lat: 44.4268, lng: 26.1025 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setCurrentPos({ lat: coords.latitude, lng: coords.longitude }),
      ()            => setCurrentPos({ lat: 44.4268, lng: 26.1025 }),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }, []);

  const findClinicsNearMe = useCallback(async () => {
    if (!currentPos) return;
    const res = await fetch(
      `${API}/clinics/near?lat=${currentPos.lat}&lng=${currentPos.lng}&radiusKm=${radius}`,
      { credentials: 'include' },
    );
    if (res.ok) setClinics(await res.json());
  }, [currentPos, user.token, radius]);


  const containerStyle = useMemo(() => ({
    width: '100%',
    height: isMobile ? '400px' : '450px',
    marginTop: '1rem',
  }), [isMobile]);


  const redIcon  = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
  const blueIcon = 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';

  if (!currentPos) return <Loader size="xl" />;
  if (!apiKey) throw new Error('Google Maps API key missing');

  const hoveredClinic = clinics.find(c => c.id === hoveredId);

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={LIBRARIES}>
      {/* Distance slider */}
      {isMobile ? (
        <div style={{ margin: '1.5rem 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SegmentedControl
            value={String(radius)}
            onChange={v => setRadius(Number(v))}
            data={[
              { label: '1 km', value: '1' },
              { label: '3 km', value: '3' },
              { label: '5 km', value: '5' },
              { label: '10 km', value: '10' },
            ]}
            color="green"
            fullWidth
            size="md"
            radius="xl"
            style={{ maxWidth: 320 }}
          />
        </div>
      ) : (
        <div
          style={{
            margin: '2rem 0 1.5rem 0',
            background: '#f6faef',
            borderRadius: 12,
            padding: '1.2rem 2rem',
            boxShadow: '0 2px 8px 0 rgba(50,80,100,0.04)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: 24,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160 }}>
            <span style={{
              fontWeight: 600,
              fontSize: 18,
              color: '#2a4365'
            }}>
              Search radius
            </span>
            <span style={{
              background: '#e6f4d7',
              color: '#5ea314',
              borderRadius: 16,
              padding: '2px 12px',
              fontWeight: 700,
              fontSize: 16,
              marginLeft: 6
            }}>
              {radius} km
            </span>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={radius}
            onChange={setRadius}
            marks={[...Array(10)].map((_, i) => ({ value: i + 1, label: `${i + 1}` }))}
            size="lg"
            color="#7bc71e"
            thumbSize={28}
            styles={{
              track: { background: '#e6f4d7' },
              thumb: { border: '2px solid #7bc71e', background: '#fff' },
              mark: { width: 2, height: 10, borderRadius: 2, background: '#7bc71e' },
              markLabel: { color: '#2a4365', fontWeight: 600, fontSize: 14 }
            }}
            style={{ flex: 1, minWidth: 200, maxWidth: 400 }}
          />
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPos}
        zoom={13}
        options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false }}
      >
        <Marker position={currentPos} title="You are here" />

        {clinics.map(c => (
          <Marker
            key={c.id}
            position={{ lat: c.latitude, lng: c.longitude }}
            title={c.name}
            icon={c.id === hoveredId ? blueIcon : redIcon}
            onMouseOver={() => {
              clearTimeout(clearTimer.current);
              setHoveredId(c.id);
            }}
            onMouseOut={() => {
              clearTimer.current = setTimeout(() => setHoveredId(null), 200);
            }}
            onClick={() => navigate(`/clinics/${c.id}/book`)}
          />
        ))}

        {hoveredClinic && (
          <InfoWindow
            position={{ lat: hoveredClinic.latitude, lng: hoveredClinic.longitude }}
            options={{
              pixelOffset: new window.google.maps.Size(0, -30),
              disableAutoPan: true,
              shouldFocus: false,
            }}
            onCloseClick={() => {}} 
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
                minWidth: 120,
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {hoveredClinic.name}
              <br />
              {visitedClinicIds.includes(hoveredClinic.id) && (
                <Button
                  size="xs"
                  mt={6}
                  onClick={() => onBookAgain?.(hoveredClinic)}
                  style={{ marginTop: 8 }}
                >
                  Book Again
                </Button>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <Button variant='gradient' gradient={{ from: 'green', to: 'green' }} onClick={findClinicsNearMe}>Find clinics near me</Button>
      </div>
      <style>{`.gm-ui-hover-effect { display: none !important; }`}</style>
    </LoadScript>
  );
}
