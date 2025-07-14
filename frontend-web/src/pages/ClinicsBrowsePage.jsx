import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Transition,
  useMantineTheme
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconBuildingHospital,
  IconMapPin,
  IconRefresh,
  IconSearch,
  IconStethoscope
} from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClinicCard from '../components/clinic/ClinicCard';
import GlassyBackground from '../components/style/GlassyBackground';
import { AuthContext } from '../contexts/AuthContext';

const API = process.env.REACT_APP_API_URL;
const CITY_OPTIONS = ['București', 'Cluj-Napoca', 'Iași', 'Timișoara', 'Brașov'];
export const SPECIALITY_OPTIONS = [
  'Dermatology',
  'Surgery',
  'Dentistry',
  'Cardiology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Internal Medicine',
  'Emergency & Critical Care',
  'Exotic Animal Medicine',
  'Anesthesiology',
  'Radiology',
  'Preventive Care',
  'Behavioral Medicine',
];

const GREEN = '#7bc71e';
const NAVBAR_BLUE = '#228be6';

export default function AllClinicsPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [city, setCity] = useState(null);
  const [spec, setSpec] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);


  useEffect(() => {
    setMounted(true);
  }, []);

  const staggerDelay = (index) => index * 100;

  const fetchClinics = async (overrideCity = city, overrideSpec = spec) => {
    if (!user) {
      setError('Please log in to view clinics');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let params = {};
      if (overrideCity) params.city = overrideCity;
      if (overrideSpec) params.speciality = overrideSpec;
      
      const { data } = await axios.get(`${API}/clinics`, {
        params,
        withCredentials: true,
      });
      
      let filteredClinics = data;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredClinics = data.filter(clinic => 
          clinic.name?.toLowerCase().includes(query) ||
          clinic.description?.toLowerCase().includes(query) ||
          clinic.city?.toLowerCase().includes(query)
        );
      }
      
      setClinics(filteredClinics);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.status === 403
          ? 'You do not have permission to view clinics.'
          : 'Failed to load clinics. Please try again later.';
      setClinics([]);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchClinics();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchClinics();
    }
  }, [city, spec]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (user) {
        fetchClinics();
      }
    }, 300); 

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleClearFilters = () => {
    setCity(null);
    setSpec(null);
    setSearchQuery('');
  };

  const hasActiveFilters = city || spec || searchQuery;

  const emptyState = (
    <Transition mounted={!loading} transition="fade" duration={400}>
      {(styles) => (
        <Center mih={300} p="xl" style={styles}>
          <Stack align="center" gap="md">
            <Box
              style={{
                animation: 'float 3s ease-in-out infinite',
                '@keyframes float': {
                  '0%, 100%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' }
                }
              }}
            >
              <IconBuildingHospital 
                size={80} 
                stroke={1.2} 
                color={GREEN}
              />
            </Box>
            <Title order={3} c="dimmed" fw={500}>
              No clinics found
            </Title>
            <Text color="dimmed" ta="center" maw={400} size="sm">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search terms.'
                : 'No clinics are available at the moment.'
              }
            </Text>
            {hasActiveFilters && (
              <Button 
                variant="light" 
                size="sm" 
                onClick={handleClearFilters}
                leftSection={<IconRefresh size={16} color={GREEN} />}
              >
                Clear Filters
              </Button>
            )}
          </Stack>
        </Center>
      )}
    </Transition>
  );

  if (!user) {
    return (
      <Transition mounted={mounted} transition="slide-up" duration={500}>
        {(styles) => (
          <Center mih="70vh" style={styles}>
            <Stack align="center" gap="lg" maw={400} p="xl">
              <Box
                p="xl"
                style={{
                  borderRadius: theme.radius.xl,
                  background: `linear-gradient(135deg, #f9fdf9 0%, #e6f7e6 100%)`,
                }}
              >
                <IconBuildingHospital size={48} color={GREEN} />
              </Box>
              <Title order={2} ta="center" fw={600}>
                Welcome to VetConnect
              </Title>
              <Text ta="center" c="dimmed" size="lg">
                Please log in to browse veterinary clinics in your area.
              </Text>
              <Button 
                size="lg" 
                radius="xl"
                onClick={() => navigate('/login')}
                style={{
                  background: `linear-gradient(135deg, ${GREEN} 0%, #5ea314 100%)`,
                  border: 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows.lg
                  }
                }}
              >
                Go to Login
              </Button>
            </Stack>
          </Center>
        )}
      </Transition>
    );
  }

  if (error) {
    return (
      <Transition mounted={mounted} transition="slide-up" duration={500}>
        {(styles) => (
          <Center mih="70vh" style={styles}>
            <Stack align="center" gap="lg" maw={400} p="xl">
              <Box
                p="xl"
                style={{
                  borderRadius: theme.radius.xl,
                  background: `linear-gradient(135deg, #f9fdf9 0%, #e6f7e6 100%)`,
                }}
              >
                <IconBuildingHospital size={48} color={GREEN} />
              </Box>
              <Title order={2} ta="center" fw={600} c="red">
                Oops!
              </Title>
              <Text ta="center" c="dimmed" size="lg">
                {error}
              </Text>
              <Button 
                size="lg" 
                radius="xl"
                variant="light" 
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </Stack>
          </Center>
        )}
      </Transition>
    );
  }

  return (
    <GlassyBackground>
      <Box
        py={isMobile ? 'xl' : '4rem'}

      >
        <Container size="lg">

          <Transition mounted={mounted} transition="slide-down" duration={600}>
            {(styles) => (
              <Group mb="xl" align="center" justify="center" style={styles}>
                <Stack gap="xs" align="center">
                  <Title
                    order={isMobile ? 2 : 1}
                    fw={700}
                    ta="center"
                    style={{
                      background: `linear-gradient(135deg, ${GREEN} 0%, #5ea314 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: isMobile ? '2rem' : '2.5rem',
                    }}
                  >
                    Browse Clinics
                  </Title>
                  <Text size="lg" c="dimmed" ta="center" maw={500}>
                    Find the perfect veterinary care for your pets
                  </Text>
                  {clinics.length > 0 && (
                    <Badge 
                      size="lg" 
                      variant="light" 
                      color="green"
                      style={{
                        animation: 'pulse 2s ease-in-out infinite',
                      }}
                    >
                      {clinics.length} clinic{clinics.length !== 1 ? 's' : ''} found
                    </Badge>
                  )}
                </Stack>
              </Group>
            )}
          </Transition>


          <Transition mounted={mounted} transition="slide-up" duration={700} delay={200}>
            {(styles) => (
              <Paper
                withBorder
                radius="xl"
                p={isMobile ? 'lg' : 'xl'}
                mb="xl"
                shadow="sm"
                style={{
                  ...styles,
                  background: '#fff',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows.md
                  }
                }}
              >
                {isMobile ? (
                  <Stack gap="lg">
                    <TextInput
                      label={<Text fw={600} size="sm">Search Clinics</Text>}
                      placeholder="Search by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fetchClinics();
                        }
                      }}
                      leftSection={<IconSearch size={18} color={GREEN} />}
                      size="md"
                      radius="md"
                    />
                    <Group grow>
                      <Select
                        label={<Text fw={600} size="sm">City</Text>}
                        placeholder="All cities"
                        data={CITY_OPTIONS}
                        value={city}
                        onChange={setCity}
                        clearable
                        leftSection={<IconMapPin size={18} color={GREEN} />}
                        size="md"
                        radius="md"
                      />
                      <Select
                        label={<Text fw={600} size="sm">Speciality</Text>}
                        placeholder="All specialities"
                        data={SPECIALITY_OPTIONS}
                        value={spec}
                        onChange={setSpec}
                        clearable
                        leftSection={<IconStethoscope size={18} color={GREEN} />}
                        size="md"
                        radius="md"
                      />
                    </Group>
                    <Group grow>
                      <Button
                        size="md"
                        radius="md"
                        color="green"
                        leftSection={<IconSearch size={18} color={GREEN} />}
                        onClick={() => fetchClinics()}
                        loading={loading}
                        fullWidth
                      >
                        Search
                      </Button>
                    
                      {hasActiveFilters && (
                        <ActionIcon
                          variant="light"
                          size="lg"
                          onClick={handleClearFilters}
                          color="green"
                        >
                          <IconRefresh size={18} color={GREEN} />
                        </ActionIcon>
                      )}
                    
                    </Group>
                  </Stack>
                ) : (
                  <Stack gap="md">
                    <TextInput
                      label="Search Clinics"
                      placeholder="Search by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fetchClinics();
                        }
                      }}
                      leftSection={<IconSearch size={16} color={GREEN} />}
                      size="md"
                      radius="md"
                    />
                    <Group grow gap="md" align="flex-end">
                      <Select
                        label="City"
                        placeholder="All cities"
                        data={CITY_OPTIONS}
                        value={city}
                        onChange={setCity}
                        clearable
                        leftSection={<IconMapPin size={16} color={GREEN} />}
                        radius="md"
                      />
                      <Select
                        label="Speciality"
                        placeholder="All specialities"
                        data={SPECIALITY_OPTIONS}
                        value={spec}
                        onChange={setSpec}
                        clearable
                        leftSection={<IconStethoscope size={16} color={GREEN} />}
                        radius="md"
                      />
                      <Button
                        color="green"
                        size="md"
                        radius="md"
                        leftSection={<IconSearch size={18} color={GREEN} />}
                        onClick={() => fetchClinics()}
                        loading={loading}
                        fullWidth
                        style={{
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                      >
                        Search
                      </Button>
                      {hasActiveFilters && (
                        <ActionIcon
                          variant="light"
                          size="lg"
                          onClick={handleClearFilters}
                          color="GREEN"
                        >
                          <IconRefresh size={16} color={GREEN} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Stack>
                )}
              </Paper>
            )}
          </Transition>


          {loading && (
            <Center py="xl">
              <Stack align="center" gap="md">
                <Loader size="lg" variant="dots" color="green" />
                <Text c="dimmed" size="sm">Loading clinics...</Text>
              </Stack>
            </Center>
          )}


          {!loading && clinics.length === 0 && emptyState}
          
          {!loading && clinics.length > 0 && (
            <SimpleGrid
              cols={{ base: 1, sm: 2, md: 3, lg: 3 }}
              spacing="xl"
              style={{
                marginTop: theme.spacing.xl,
              }}
            >
              {clinics.map((clinic, index) => {
                const targetPath = `/clinics/${clinic.id}/book`;
                return (
                  <Transition
                    key={clinic.id}
                    mounted={mounted}
                    transition="slide-up"
                    duration={500}
                    delay={staggerDelay(index)}
                  >
                    {(styles) => (
                      <Box
                      >
                        <ClinicCard
                          clinic={clinic}
                          component={Link}
                          to={targetPath}
                          state={{ clinic: clinic }}
                          style={{
                            height: '100%',
                            borderRadius: theme.radius.lg,
                            overflow: 'hidden',
                            background: theme.colorScheme === 'dark' 
                              ? `rgba(${theme.colors.dark[6]}, 0.9)`
                              : 'rgba(249, 253, 249, 0.97)',
                            border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : '#e6f7e6'}`,
                          }}
                        />
                      </Box>
                    )}
                  </Transition>
                );
              })}
            </SimpleGrid>
          )}
        </Container>
      </Box>
    </GlassyBackground>
  );
}