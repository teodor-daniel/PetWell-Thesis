import { Alert, Badge, Button, Card, Container, Grid, Group, Loader, Modal, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconBuilding, IconPlus, IconStethoscope } from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateClinicForm from '../components/forms/CreateClinicForm';
import { AuthContext } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topDoctors, setTopDoctors] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [vetNames, setVetNames] = useState({}); 

  useEffect(() => {
    const fetchClinics = async () => {
      if (!user) {
        setError('You must be logged in to view your clinics.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE}/clinics/mine`, {
          withCredentials: true,
        });
        setClinics(response.data);
      } catch (err) {
        console.error("Error fetching owner's clinics:", err);
        setError(err.response?.data?.message || err.message || 'Failed to load your clinics.');
        setClinics([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, [user]); 

  useEffect(() => {
    if (!user || clinics.length === 0) return;
    const fetchTopDoctors = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      const results = {};
      try {
        for (const clinic of clinics) {
          const res = await axios.get(`${API_BASE}/analytics/clinics/${clinic.id}/top-doctors`, {
            withCredentials: true,
          });
          results[clinic.id] = res.data;
        }
        setTopDoctors(results);
      } catch (err) {
        setAnalyticsError('Failed to load analytics.');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchTopDoctors();
  }, [user, clinics]);

  
  useEffect(() => {
    const vetIds = new Set();
    Object.values(topDoctors).forEach(arr => {
      (arr || []).forEach(([vetId]) => vetIds.add(vetId));
    });
    const missingVetIds = Array.from(vetIds).filter(id => !vetNames[id]);
    if (missingVetIds.length === 0) return;
    const fetchNames = async () => {
      const updates = {};
      await Promise.all(missingVetIds.map(async (vetId) => {
        try {
          const res = await axios.get(`${API_BASE}/vets/${vetId}`, { withCredentials: true });
          updates[vetId] = res.data.fullName || vetId;
        } catch {
          updates[vetId] = vetId;
        }
      }));
      setVetNames(prev => ({ ...prev, ...updates }));
    };
    fetchNames();
  }, [topDoctors, vetNames]);

  const handleCreateClinicSuccess = () => {
    setShowCreateModal(false);
    window.location.reload();
  };

  return (
    <Container size="xl" py="xl">
      <Group position="apart" mb="xl">
        <Title order={1}>My Clinics Dashboard</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setShowCreateModal(true)}
          color="green"
        >
          Add Clinic
        </Button>
      </Group>

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
                          onClick={() => navigate(`/clinics/${clinic.id}`)}
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
            <Stack align="center" spacing="md">
              <Text>You haven't added any clinics yet.</Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setShowCreateModal(true)}
                color="green"
              >
                Add Your First Clinic
              </Button>
            </Stack>
          )}          {!loading && !error && clinics.length > 0 && (
            <>
              <Title order={2} mt="xl" mb="md">Clinic Analytics</Title>
              {analyticsLoading && <Loader size="md" />}
              {analyticsError && <Alert color="red">{analyticsError}</Alert>}
              {clinics.map(clinic => (
                <Paper key={clinic.id} shadow="xs" p="lg" mb="lg" radius="md" withBorder>
                  <Group justify="space-between" mb="sm">
                    <Group gap={8} align="center">
                      <IconStethoscope size={22} color="#7bc71e" />
                      <Title order={4} mb={0}>{clinic.name}</Title>
                      <Badge color="green" variant="light" size="sm">Top Doctors</Badge>
                    </Group>
                    <Text c="dimmed" size="sm">by Appointments</Text>
                  </Group>
                  <Table striped highlightOnHover withColumnBorders verticalSpacing="sm" fontSize="sm">
                    <thead style={{ background: '#fff' }}>
                      <tr>
                        <th style={{ fontWeight: 700, textAlign: 'left' }}>Doctor</th>
                        <th style={{ fontWeight: 700, textAlign: 'right' }}>Appointments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(topDoctors[clinic.id] || []).length === 0 ? (
                        <tr><td colSpan={2}><Text c="dimmed">No data</Text></td></tr>
                      ) : (
                        topDoctors[clinic.id].map(([vetId, count]) => (
                          <tr key={vetId}>
                            <td style={{ textAlign: 'left' }}>{vetNames[vetId] || vetId}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{count}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </Paper>
              ))}
            </>
          )}
        </>
      )}      <Modal
        opened={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Clinic"
        size="lg"
        closeOnClickOutside={false}
      >
        <CreateClinicForm onClose={handleCreateClinicSuccess} />
      </Modal>
    </Container>
  );
};

export default Dashboard;