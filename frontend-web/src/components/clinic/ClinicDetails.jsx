import {
  Button,
  Container,
  Grid,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';

const ClinicDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchClinicDetails();
  }, [id]);

  const fetchClinicDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/clinics/${id}`,
        { 
          withCredentials: true 
        }
      );
      setClinic(response.data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch clinic details',
        color: 'red',
      });
      navigate('/my-clinics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingOverlay visible={true} />;
  }

  if (!clinic) {
    return null;
  }

  return (
    <Container size="lg">
      <Paper p="xl" radius="md" withBorder>
        <Stack spacing="xl">
          <Group position="apart">
            <Title order={2}>{clinic.name}</Title>
            <Group>
              <Button variant="light" onClick={() => navigate(`/clinic/${id}/edit`)}>
                Edit Clinic
              </Button>
              <Button variant="light" onClick={() => navigate('/my-clinics')}>
                Back to My Clinics
              </Button>
            </Group>
          </Group>

          <Grid>
            <Grid.Col span={12} md={6}>
              <Stack spacing="md">
                <Title order={3}>Contact Information</Title>
                <Text><strong>Address:</strong> {clinic.address}</Text>
                <Text><strong>City:</strong> {clinic.city}</Text>
                <Text><strong>Phone:</strong> {clinic.phone}</Text>
                <Text><strong>Email:</strong> {clinic.email}</Text>
              </Stack>
            </Grid.Col>

            <Grid.Col span={12} md={6}>
              <Stack spacing="md">
                <Title order={3}>Location</Title>
                <Text><strong>Latitude:</strong> {clinic.latitude}</Text>
                <Text><strong>Longitude:</strong> {clinic.longitude}</Text>

              </Stack>
            </Grid.Col>
          </Grid>

        </Stack>
      </Paper>
    </Container>
  );
};

export default ClinicDetails; 