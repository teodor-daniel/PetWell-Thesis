import {
  Alert,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { IconAlertCircle, IconBuilding } from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL;

export default function VetMainPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const loadClinics = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${API_BASE}/clinics/vet`,
          { withCredentials: true }
        );
        setClinics(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load clinics.');
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      loadClinics();
    }
  }, [user?.id]);

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">My Clinics Dashboard</Title>
      {loading && <Loader size="lg" />}

      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" mb="lg">
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {clinics.length > 0 ? (
            <Grid>
              {clinics.map(clinic => (
                <Grid.Col key={clinic.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card shadow="sm" p="lg" radius="md" withBorder>
                    <Stack spacing="md">
                      <Group position="apart">
                        <Group>
                          <IconBuilding size={24} />
                          <Stack gap={0}>
                            <Text weight={500}>{clinic.name}</Text>
                            <Text size="sm" color="dimmed">{clinic.address}</Text>
                          </Stack>
                        </Group>
                        <Button
                          variant="light"
                          onClick={() => navigate(`/clinics/${clinic.id}/dashboard`)}
                        >
                          View Clinic
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          ) : (
            <Text>You are not associated with any clinics yet.</Text>
          )}
        </>
      )}
    </Container>
  );
} 