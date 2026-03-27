import {
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import GlassyBackground from '../components/style/GlassyBackground';


const NAVBAR_BLUE = '#228be6';

export default function ClinicAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { clinicId } = useParams();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const today = new Date();
        const from = new Date(today);
        from.setHours(0, 0, 0, 0);
        const to = new Date(today);
        to.setDate(to.getDate() + 30);

        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/appointments/clinic/${clinicId}`,
          {
            params: {
              from: from.toISOString(),
              to: to.toISOString(),
            },
            withCredentials: true,
          }
        );
        setAppointments(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      loadAppointments();
    }
  }, [clinicId, ]);

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/appointments/${appointmentId}`,
        {
          withCredentials: true,
        }
      );
     
      setAppointments(appointments.filter(apt => apt.id !== appointmentId));
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      setError('Failed to cancel appointment');
    }
  };

  if (loading) return <Loader />;
  if (error) return <Text color="red">{error}</Text>;

  return (
    <GlassyBackground>
      <Container size="xl" py="xl">
        <Stack spacing="xl">
          <Group position="apart">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate('/vet-dashboard')}
              style={{ color: NAVBAR_BLUE }}
            >
              Back to Dashboard
            </Button>
            <Title order={2} style={{ color: NAVBAR_BLUE }}>Clinic Appointments</Title>
          </Group>

          {!appointments || appointments.length === 0 ? (
            <Text color="dimmed" align="center" py="xl">
              No appointments scheduled for the next 30 days
            </Text>
          ) : (
            <Stack spacing="xs">
              {appointments.map((appointment) => (
                <Paper key={appointment.id} p="sm" withBorder>
                  <Group position="apart">
                    <Stack spacing={20}>
                      <Text weight={500}>
                        {appointment.petName || `Pet ID: ${appointment.petId}`}
                      </Text>
                      <Text size="sm" color="dimmed">
                        {new Date(appointment.appointmentDate).toLocaleString([], {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </Stack>
                    <Group>
                      <Text size="sm" color={appointment.status === 'CONFIRMED' ? 'green' : 'orange'}>
                        {appointment.status}
                      </Text>
                      {appointment.status === 'CONFIRMED' && (
                        <Button
                          variant="light"
                          color="red"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>
    </GlassyBackground>
  );
} 