import {
  Button,
  Card,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendar } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ClinicCalendar = ({ clinicId, userRole }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const today = new Date();
        const from = new Date(today);
        from.setHours(0, 0, 0, 0);
        const to = new Date(today);
        to.setDate(to.getDate() + 30); 
        
        to.setHours(23, 59, 59, 999);

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
        console.log('Appointments data:', data); 
        
        setAppointments(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [clinicId]);

  if (loading) return <Loader />;
  if (error) return <Text color="red">{error}</Text>;

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack spacing="md">
        <Group position="apart">
          <Title order={3}>Upcoming Appointments</Title>
          {userRole === 'USER' && (
            <Button
              leftSection={<IconCalendar size={16} />}
              onClick={() => navigate(`/clinics/${clinicId}/book`)}
            >
              Book Appointment
            </Button>
          )}
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
                  <Stack spacing={0}>
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
                  <Text size="sm" color={
                    appointment.status === 'CONFIRMED' ? 'green' :
                    appointment.status === 'PENDING' ? 'yellow' :
                    'red'
                  }>
                    {appointment.status}
                  </Text>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export default ClinicCalendar; 