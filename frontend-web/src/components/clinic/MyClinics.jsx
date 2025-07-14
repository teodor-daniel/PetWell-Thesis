import { Button, Card, Grid, Group, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const MyClinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/clinics/mine`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setClinics(response.data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch clinics',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Text size="xl" weight={500}>My Clinics</Text>
        <Button onClick={() => navigate('/create-clinic')}>
          Create New Clinic
        </Button>
      </Group>

      <Grid>
        {clinics.map((clinic) => (
          <Grid.Col key={clinic.id} span={12} sm={6} lg={4}>
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <Stack spacing="xs">
                <Text size="lg" weight={500}>{clinic.name}</Text>
                <Text size="sm" color="dimmed">{clinic.address}</Text>
                <Text size="sm">{clinic.phone}</Text>
                <Text size="sm">{clinic.email}</Text>
                <Text size="sm">{clinic.city}</Text>
                
                <Group position="right" mt="md">
                  <Button 
                    variant="light" 
                    onClick={() => navigate(`/clinic/${clinic.id}`)}
                  >
                    View Details
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {clinics.length === 0 && (
        <Text align="center" color="dimmed">
          You don't have any clinics yet. Create your first clinic to get started!
        </Text>
      )}
    </Stack>
  );
};

export default MyClinics;