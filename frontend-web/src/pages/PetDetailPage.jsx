import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Title, Text, Group, Stack, Button, Image, Loader, Divider, Table, Badge, ActionIcon, Card, SimpleGrid, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconPaw, IconFileText, IconDownload, IconStethoscope, IconVaccine, IconPill, IconScissors, IconTestPipe, IconEdit, IconCheck, IconX, IconCalendar, IconWeight, IconCake, IconUser } from '@tabler/icons-react';
import axios from 'axios';
import GlassyBackground from '../components/style/GlassyBackground';
import { TextInput, NumberInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Navbar from '../components/navigation/Navbar';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceArea, ResponsiveContainer } from 'recharts';

const GREEN = '#7bc71e';

const TYPE_OPTIONS = [
  { value: 'Vaccination', label: 'Vaccination', icon: <IconVaccine size={16} />, color: 'blue' },
  { value: 'Deworming', label: 'Deworming (internal/external)', icon: <IconPill size={16} />, color: 'orange' },
  { value: 'Sterilization', label: 'Sterilization / Neutering', icon: <IconScissors size={16} />, color: 'purple' },
  { value: 'Check-up', label: 'Routine Check-up', icon: <IconStethoscope size={16} />, color: 'green' },
  { value: 'Blood/urine tests', label: 'Blood & Urine Tests', icon: <IconTestPipe size={16} />, color: 'red' },
];

function getTypeLabel(type) {
  const t = TYPE_OPTIONS.find(opt => opt.value === type);
  return t ? t.label : type;
}

function getTypeIcon(type) {
  const t = TYPE_OPTIONS.find(opt => opt.value === type);
  return t ? t.icon : <IconStethoscope size={16} />;
}

function getTypeColor(type) {
  const t = TYPE_OPTIONS.find(opt => opt.value === type);
  return t ? t.color : 'gray';
}

export default function PetDetailPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editAge, setEditAge] = useState(null);
  const [editWeight, setEditWeight] = useState(null);
  const [saving, setSaving] = useState(false);
  const [clinicNames, setClinicNames] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useContext(AuthContext);
  const [statistics, setStatistics] = useState([]);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const api = process.env.REACT_APP_API_URL;

  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    axios.get(`${api}/pets/${petId}`)
      .then(res => setPet(res.data))
      .catch(() => setError('Could not load pet info.'))
      .finally(() => setLoading(false));
  }, [petId, api]);

  useEffect(() => {
    if (!pet || !pet.name) return;

    
    if (pet.imageUrl) {
      axios.get(`${api}/api/pet-image/${pet.name}`)
        .then(res => setImageUrl(res.data))
        .catch((error) => {
          
          if (error.response && error.response.status === 500) {
            console.error('Database inconsistency detected for pet image:', error.response.data);
          }
          setImageUrl(null);
        });
    } else {
      
      axios.get(`${api}/api/picture/${pet.name}`)
        .then(res => setImageUrl(res.data))
        .catch((error) => {
          
          if (error.response && error.response.status === 500) {
            console.error('Database inconsistency detected for pet image:', error.response.data);
          }
          setImageUrl(null);
        });
    }
  }, [pet, api]);

  useEffect(() => {
    setRecordsLoading(true);
    axios.get(`${api}/api/medical-record/pet/${petId}`)
      .then(res => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRecords([]))
      .finally(() => setRecordsLoading(false));
  }, [petId, api]);

  useEffect(() => {
    if (!pet || !pet.ownerId) return;
    setAppointmentsLoading(true);
    axios.get(`${api}/appointments/owner/${pet.ownerId}?from=1970-01-01T00:00:00Z&to=2100-01-01T00:00:00Z`)
      .then(res => {
        const appts = Array.isArray(res.data) ? res.data : [];
        setAppointments(appts.filter(a => a.petId === petId));
      })
      .catch(() => setAppointments([]))
      .finally(() => setAppointmentsLoading(false));
  }, [pet, petId, api]);

  useEffect(() => {
    async function fetchClinicNames() {
      const missing = appointments.filter(a => !a.clinicName && a.clinicId);
      const uniqueIds = [...new Set(missing.map(a => a.clinicId))];
      const names = {};
      await Promise.all(uniqueIds.map(async id => {
        try {
          const res = await axios.get(`${api}/clinics/${id}`);
          names[id] = res.data.name;
        } catch { }
      }));
      setClinicNames(prev => ({ ...prev, ...names }));
    }
    if (appointments.length) fetchClinicNames();
  }, [appointments, api]);

  useEffect(() => {
    setEditAge(pet?.birthdate || '');
    setEditWeight(pet?.weight || '');
  }, [pet]);

  useEffect(() => {
    if (!pet) return;
    axios.get(`${api}/pets/${petId}/statistics`)
      .then(res => setStatistics(Array.isArray(res.data) ? res.data : []))
      .catch(() => setStatistics([]));
  }, [pet, petId, api]);

  function calculateAge(birthdate) {
    if (!birthdate) return null;
    const now = new Date();
    const dob = new Date(birthdate);
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months };
  }

  
  function filterAppointments(appointments) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 

    return appointments.filter(appointment => {
      if (!appointment.appointmentDate) return false;

      const appointmentDate = new Date(appointment.appointmentDate);
      const appointmentDay = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());

      
      if (appointment.status === 'PENDING' && appointmentDate < now) {
        return false;
      }

      
      if (appointment.status === 'CANCELLED') {
        return appointmentDay.getTime() === today.getTime();
      }

      
      return true;
    });
  }

  const age = calculateAge(pet?.birthdate);

  
  function getHealthyRange(species, build) {
    if (!species || !build) return [0, 0];
    const s = species.toLowerCase();
    const b = build.toUpperCase();
    if (s === 'cat') {
      if (b === 'SMALL') return [2, 3.5];
      if (b === 'MEDIUM') return [3.5, 5];
      if (b === 'LARGE') return [5, 7];
    }
    if (s === 'dog') {
      if (b === 'SMALL') return [2, 8];
      if (b === 'MEDIUM') return [8, 25];
      if (b === 'LARGE') return [25, 45];
    }
    return [0, 0];
  }
  const [minHealthy, maxHealthy] = getHealthyRange(pet?.species, pet?.build);
  const chartData = statistics.map(s => ({
    date: s.changedAt ? new Date(s.changedAt).toLocaleDateString() : '',
    weight: s.currentWeight
  }));

  async function handleSave() {
    setSaving(true);
    try {
      await axios.put(`${api}/pets/${petId}`, {
        ...pet,
        birthdate: editAge,
        weight: editWeight,
      });
      setPet({ ...pet, birthdate: editAge, weight: editWeight });
      setEditMode(false);
    } catch (e) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  const containerStyle = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const cardHoverStyle = {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
  };

  const buttonHoverStyle = {
    transition: 'all 0.2s ease',
    transform: 'scale(1)',
  };

  
  function getUniqueRecords(records) {
    const seen = new Set();
    return records.filter(record => {
      const key = `${record.petId}-${record.fileName}-${record.createdAt ? new Date(record.createdAt).toISOString().slice(0,10) : ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  if (loading) {
    return (
      <GlassyBackground>
        <Container size="sm" py="xl" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Stack align="center" spacing="md">
            <Loader size="lg" color={GREEN} />
            <Text color="dimmed">Loading pet information...</Text>
          </Stack>
        </Container>
      </GlassyBackground>
    );
  }

  if (error) {
    return (
      <GlassyBackground>
        <Container size="sm" py="xl">
          <Paper shadow="md" p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
            <IconPaw size={48} color="gray" style={{ marginBottom: 16 }} />
            <Text color="red" size="lg">{error}</Text>
            <Button mt="md" onClick={() => navigate(-1)} leftSection={<IconArrowLeft size={16} />}>
              Go Back
            </Button>
          </Paper>
        </Container>
      </GlassyBackground>
    );
  }

  if (!pet) {
    return (
      <GlassyBackground>
        <Container size="sm" py="xl">
          <Paper shadow="md" p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
            <IconPaw size={48} color="gray" style={{ marginBottom: 16 }} />
            <Text color="red" size="lg">Pet not found.</Text>
            <Button mt="md" onClick={() => navigate(-1)} leftSection={<IconArrowLeft size={16} />}>
              Go Back
            </Button>
          </Paper>
        </Container>
      </GlassyBackground>
    );
  }

  return (
    <GlassyBackground>
      <Navbar />
      <Container size="lg" py="xl" style={containerStyle}>

        <Group mb="xl">
          <ActionIcon
            size="lg"
            variant="subtle"
            color="gray"
            onClick={() => navigate('/home')}
            style={{
              ...buttonHoverStyle,
              ':hover': { transform: 'scale(1.1)' }
            }}
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Title order={1} style={{ color: GREEN, fontWeight: 700 }}>
            Pet Profile
          </Title>
        </Group>


        <Paper
          shadow="lg"
          p={isMobile ? "md" : "xl"}
          radius="xl"
          withBorder
          mb="xl"
          style={{
            border: '1px solid rgba(255,255,255,0.2)',
            ':hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(123, 199, 30, 0.1)',
            }
          }}
        >
          <Group align="flex-start" spacing={isMobile ? 16 : 32} wrap="nowrap">
            <div style={{ position: 'relative' }}>

              <Image
                src={imageUrl || (pet.species?.toLowerCase() === 'cat' ? '/cat_placeholder.webp' :
                  pet.species?.toLowerCase() === 'dog' ? '/dog_placeholder.webp' :
                    '/placeholder.jpg')}
                alt={pet.name}
                width={isMobile ? 100 : 140}
                height={isMobile ? 100 : 140}
                radius="50%"
                fit="cover"
                style={{
                  border: `3px solid ${GREEN}`,
                  transition: 'all 0.3s ease',

                  ':hover': { transform: 'scale(1.05)' }
                }}
              />
            </div>

            <Stack spacing={12} style={{ flex: 1 }}>
              <Group spacing={12} align="center">
                <Title order={1} style={{ color: GREEN, fontWeight: 800, fontSize: isMobile ? 24 : 32 }}>
                  {pet.name}
                </Title>
                {!editMode && (
                  <Tooltip label="Edit pet info">
                    <ActionIcon
                      variant="subtle"
                      color={GREEN}
                      onClick={() => setEditMode(true)}
                      style={{
                        transition: 'all 0.2s ease',
                        ':hover': { transform: 'rotate(15deg) scale(1.1)' }
                      }}
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>

              <SimpleGrid cols={isMobile ? 1 : 2} spacing="xs">
                <Group spacing={8}>
                  <IconPaw size={16} color={GREEN} />
                  <Text size="sm" color="dimmed"><strong>Species:</strong> {pet.species}</Text>
                </Group>
                {pet.breed && (
                  <Group spacing={8}>
                    <IconPaw size={16} color={GREEN} />
                    <Text size="sm" color="dimmed"><strong>Breed:</strong> {pet.breed}</Text>
                  </Group>
                )}
                <Group spacing={8}>
                  <Badge color={pet.neutered ? 'green' : 'gray'} size="sm">
                    {pet.neutered ? 'Neutered' : 'Not Neutered'}
                  </Badge>
                  <Badge color="blue" size="sm">
                    {pet.build ? pet.build.charAt(0) + pet.build.slice(1).toLowerCase() : 'Build'}
                  </Badge>
                </Group>
                {pet.owner && (
                  <Group spacing={8}>
                    <IconUser size={16} color={GREEN} />
                    <Text size="sm" color="dimmed"><strong>Owner:</strong> {pet.owner.fullName}</Text>
                  </Group>
                )}
              </SimpleGrid>

              {editMode ? (
                <Stack spacing="sm" mt="md">
                  <TextInput
                    label="Birthdate"
                    placeholder="YYYY-MM-DD"
                    value={editAge}
                    onChange={e => setEditAge(e.target.value)}
                    icon={<IconCake size={16} />}
                    size="sm"
                    styles={{
                      input: { transition: 'all 0.2s ease', ':focus': { transform: 'scale(1.02)' } }
                    }}
                  />
                  <NumberInput
                    label="Weight (kg)"
                    value={editWeight}
                    onChange={setEditWeight}
                    icon={<IconWeight size={16} />}
                    size="sm"
                    styles={{
                      input: { transition: 'all 0.2s ease', ':focus': { transform: 'scale(1.02)' } }
                    }}
                  />
                  <Group spacing={8} mt="sm">
                    <Button
                      size="sm"
                      color="green"
                      loading={saving}
                      onClick={handleSave}
                      leftSection={<IconCheck size={16} />}
                      style={{
                        ...buttonHoverStyle,
                        ':hover': { transform: 'scale(1.05)' }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      leftSection={<IconX size={16} />}
                      style={{
                        ...buttonHoverStyle,
                        ':hover': { transform: 'scale(1.05)' }
                      }}
                    >
                      Cancel
                    </Button>
                  </Group>
                </Stack>
              ) : (
                <SimpleGrid cols={isMobile ? 1 : 2} spacing="xs" mt="md">
                  {pet.birthdate && age && (
                    <Group spacing={8}>
                      <IconCake size={16} color={GREEN} />
                      <Text size="sm" color="dimmed"><strong>Age:</strong> {age.years}y {age.months}m</Text>
                    </Group>
                  )}
                  {pet.weight && (
                    <Group spacing={8}>
                      <IconWeight size={16} color={GREEN} />
                      <Text size="sm" color="dimmed"><strong>Weight:</strong> {pet.weight} kg</Text>
                    </Group>
                  )}
                </SimpleGrid>
              )}
            </Stack>
          </Group>
        </Paper>


        <Paper
          shadow="md"
          p={isMobile ? "md" : "xl"}
          radius="xl"
          withBorder
          mb="xl"
          style={{
            background: 'transparent',
            ...cardHoverStyle,
            ':hover': { transform: 'translateY(-2px)' }
          }}
        >
          <Group mb="lg" spacing={12}>
            <IconFileText size={24} color={GREEN} />
            <Title order={2} style={{ color: GREEN }}>Medical Records</Title>
          </Group>

          {recordsLoading ? (
            <Group spacing="sm" align="center">
              <Loader size="sm" color={GREEN} />
              <Text color="dimmed">Loading medical records...</Text>
            </Group>
          ) : records.length === 0 ? (
            <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(123, 199, 30, 0.05)', textAlign: 'center' }}>
              <IconFileText size={32} color="gray" style={{ marginBottom: 8 }} />
              <Text color="dimmed">No medical records found.</Text>
            </Paper>
          ) : (
            <Stack spacing="sm">
              {getUniqueRecords(records).map((record, index) => (
                <Card
                  key={record.id}
                  shadow="xs"
                  p="md"
                  radius="lg"
                  style={{
                    ...cardHoverStyle,
                    animationDelay: `${index * 0.1}s`,
                    animation: 'slideInRight 0.5s ease-out',
                    ':hover': {
                      transform: 'translateX(8px)',
                      boxShadow: '0 8px 25px rgba(123, 199, 30, 0.15)'
                    }
                  }}
                >
                  <Group position="apart" align="center">
                    <Group spacing={12}>
                      <IconFileText size={20} color={GREEN} />
                      <div>
                        <Text fw={600}>{record.fileName}</Text>
                        <Text size="sm" color="dimmed">
                          {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'Unknown date'}
                        </Text>
                      </div>
                    </Group>
                    <Button
                      size="sm"
                      variant="light"
                      color={GREEN}
                      leftSection={<IconDownload size={16} />}
                      style={{
                        ...buttonHoverStyle,
                        ':hover': { transform: 'scale(1.05)' }
                      }}
                      onClick={async () => {
                        try {
                          const { data: url } = await axios.get(
                            `${api}/api/medical-record/download/${record.id}`,
                            { withCredentials: true, }
                          );
                          window.open(url, '_blank');
                        } catch (err) {
                          alert('Failed to download file.');
                        }
                      }}
                    >
                      Download
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>


        <Paper
          shadow="md"
          p={isMobile ? "md" : "xl"}
          radius="xl"
          withBorder
          mb="xl"
          style={{
            background: 'transparent',
            ...cardHoverStyle,
            ':hover': { transform: 'translateY(-2px)' }
          }}
        >
          <Group mb="lg" spacing={12}>
            <IconCalendar size={24} color={GREEN} />
            <Title order={2} style={{ color: GREEN }}>Appointment History</Title>
          </Group>

          {appointmentsLoading ? (
            <Group spacing="sm" align="center">
              <Loader size="sm" color={GREEN} />
              <Text color="dimmed">Loading appointments...</Text>
            </Group>
          ) : appointments.length === 0 ? (
            <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(123, 199, 30, 0.05)', textAlign: 'center' }}>
              <IconCalendar size={32} color="gray" style={{ marginBottom: 8 }} />
              <Text color="dimmed">No appointments found.</Text>
            </Paper>
          ) : (
            <Stack spacing="sm">
              {filterAppointments(appointments).map((appointment, index) => (
                <Card
                  key={appointment.id}
                  shadow="xs"
                  p="md"
                  radius="lg"
                  style={{
                    ...cardHoverStyle,
                    animationDelay: `${index * 0.1}s`,
                    animation: 'slideInLeft 0.5s ease-out',
                    ':hover': {
                      transform: 'translateX(-8px)',
                      boxShadow: '0 8px 25px rgba(123, 199, 30, 0.15)'
                    }
                  }}
                >
                  <Group position="apart" align="center" wrap="nowrap">
                    <Group spacing={12} style={{ flex: 1 }}>
                      <div style={{
                        padding: 8,
                        borderRadius: '50%',
                        backgroundColor: `var(--mantine-color-${getTypeColor(appointment.type)}-1)`
                      }}>
                        {getTypeIcon(appointment.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Text fw={600}>{getTypeLabel(appointment.type)}</Text>
                        <Text size="sm" color="dimmed">
                          {appointment.clinicName || clinicNames[appointment.clinicId] || 'Unknown Clinic'}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleString() : 'No date'}
                        </Text>
                      </div>
                    </Group>
                    <Badge
                      color={
                        appointment.status === 'CONFIRMED' ? 'green' :
                          appointment.status === 'CANCELLED' ? 'red' :
                            'orange'
                      }
                      variant="light"
                      size="lg"
                      style={{
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        minWidth: 80,
                        textAlign: 'center'
                      }}
                    >
                      {appointment.status?.toLowerCase()}
                    </Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>


        <Paper
          shadow="md"
          p={isMobile ? "md" : "xl"}
          radius="xl"
          withBorder
          style={{
            background: 'linear-gradient(135deg, rgba(123, 199, 30, 0.05) 0%, rgba(123, 199, 30, 0.02) 100%)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            ...cardHoverStyle,
            ':hover': { transform: 'translateY(-2px)' }
          }}
        >
          <Stack align="center" spacing="md">
            <div style={{
              padding: 16,
              borderRadius: '50%',
              backgroundColor: 'rgba(123, 199, 30, 0.1)',
              animation: 'pulse 2s infinite'
            }}>
              <IconStethoscope size={32} color={GREEN} />
            </div>
            <Title order={3} style={{ color: GREEN }}>Weight History</Title>
            {chartData.length === 0 ? (
              <Text color="dimmed" size="lg">No weight history yet.</Text>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, Math.max(maxHealthy + 2, ...chartData.map(d => d.weight || 0))]} />
                  <RechartsTooltip />

                  <ReferenceArea y1={minHealthy} y2={maxHealthy} strokeOpacity={0.1} fill="#7bc71e" fillOpacity={0.2} />
                  <Line type="monotone" dataKey="weight" stroke="#7bc71e" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
            <Text color="dimmed" size="sm">
              Healthy range for a {pet?.species?.toLowerCase()} ({pet?.build?.toLowerCase()}): {minHealthy}–{maxHealthy} kg
            </Text>
          </Stack>
        </Paper>
      </Container>

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
          60% {
            transform: translateY(-4px);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </GlassyBackground>
  );
}