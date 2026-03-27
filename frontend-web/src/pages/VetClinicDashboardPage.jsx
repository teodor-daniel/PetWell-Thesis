import { ActionIcon, Badge, Button, Card, Center, Container, FileInput, Group, Loader, Paper, Select, Stack, Table, Tabs, Text, TextInput, Title } from '@mantine/core';
import { IconDownload, IconSearch, IconUpload } from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppointmentCalendar from '../components/AppointmentCalendar';
import ClinicPastAppointmentsTable from '../components/clinic/ClinicPastAppointmentsTable';
import { AuthContext } from '../contexts/AuthContext';

const API = process.env.REACT_APP_API_URL;

function ClinicMedicalRecordsTab({ clinicId }) {
  const { user } = useContext(AuthContext);
  const [petNameFilter, setPetNameFilter] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [filteredMedicalRecords, setFilteredMedicalRecords] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [users, setUsers] = useState([]);

  const auth = { withCredentials: true };

  const fetchMedicalRecords = async (filters = {}) => {
    setLoadingRecords(true);
    try {
      const params = new URLSearchParams();
      if (filters.petName) params.append('petName', filters.petName);
      if (filters.uploaderName) params.append('uploaderName', filters.uploaderName);
      if (filters.fileName) params.append('fileName', filters.fileName);
      const { data } = await axios.get(`${API}/api/medical-record/clinic/${clinicId}/confirmed-appointments?${params}`, auth);
      setMedicalRecords(data);
      setFilteredMedicalRecords(data);
    } catch (e) {
      try {
        const params = new URLSearchParams();
        if (filters.petName) params.append('petName', filters.petName);
        if (filters.uploaderName) params.append('uploaderName', filters.uploaderName);
        if (filters.fileName) params.append('fileName', filters.fileName);
        const { data } = await axios.get(`${API}/api/medical-record/clinic/${clinicId}/all?${params}`, auth);
        setMedicalRecords(data);
        setFilteredMedicalRecords(data);
      } catch (fallbackError) {
        setMedicalRecords([]);
        setFilteredMedicalRecords([]);
      }
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
    fetchUsers();
    
  }, [clinicId]);

  useEffect(() => {
    if (medicalRecords.length > 0) {
      const filters = {
        petName: petNameFilter || undefined,
        uploaderName: uploaderFilter || undefined,
        fileName: fileTypeFilter || undefined,
      };
      const hasFilters = Object.values(filters).some(filter => filter !== undefined);
      if (hasFilters) {
        fetchMedicalRecords(filters);
      } else {
        setFilteredMedicalRecords(medicalRecords);
      }
    }
    
  }, [petNameFilter, uploaderFilter, fileTypeFilter]);

  const fetchUsers = async () => {
    if (!clinicId) return;
    try {
      const { data } = await axios.get(`${API}/users/clinic/${clinicId}/confirmed-users`, auth);
      setUsers(data);
    } catch (e) {
      setUsers([]);
    }
  };

  const handleUploadRecord = async () => {
    if (!selectedPet || !selectedFile || !selectedUser || !user?.id) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('petId', selectedPet);
    formData.append('isClinic', 'true');
    formData.append('clinicId', clinicId);
    formData.append('vetId', user.id);
    try {
      await axios.post(`${API}/api/medical-record/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setSelectedFile(null);
      setSelectedPet(null);
      setSelectedUser(null);
      fetchMedicalRecords();
    } catch (e) {
      
    } finally {
      setUploading(false);
    }
  };

  
  const getUniqueRecords = (records) => {
    const seen = new Set();
    return records.filter(record => {
      const key = `${record.petId}-${record.fileName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  return (
    <Stack spacing="md">
      <Paper shadow="sm" p="md" withBorder>
        <Stack spacing="md">
          <Title order={4}>Filters</Title>
          <Group grow>
            <TextInput placeholder="Filter by pet name..." value={petNameFilter} onChange={e => setPetNameFilter(e.target.value)} leftSection={<IconSearch size={16} />} />
            <TextInput placeholder="Filter by uploader..." value={uploaderFilter} onChange={e => setUploaderFilter(e.target.value)} leftSection={<IconSearch size={16} />} />
            <TextInput placeholder="Filter by file type..." value={fileTypeFilter} onChange={e => setFileTypeFilter(e.target.value)} leftSection={<IconSearch size={16} />} />
          </Group>
          <Button variant="outline" onClick={() => { setPetNameFilter(''); setUploaderFilter(''); setFileTypeFilter(''); fetchMedicalRecords({}); }}>Clear Filters</Button>
        </Stack>
      </Paper>
      <Paper shadow="sm" p="lg" withBorder>
        {loadingRecords ? (
          <Center py="xl"><Loader /></Center>
        ) : filteredMedicalRecords.length === 0 ? (
          <Text color="dimmed" align="center">{medicalRecords.length === 0 ? 'No medical records found' : 'No records match the current filters'}</Text>
        ) : (
          <>
            <Group position="apart" mb="md">
              <Text size="sm" color="dimmed">Showing {getUniqueRecords(filteredMedicalRecords).length} of {getUniqueRecords(medicalRecords).length} records</Text>
            </Group>
            <Table>
              <thead>
                <tr>
                  <th>Pet Name</th>
                  <th>File Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getUniqueRecords(filteredMedicalRecords).map((record) => (
                  <tr key={record.id}>
                    <td>{record.petName}</td>
                    <td>{record.fileName}</td>
                    <td>{record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-GB') : '-'}</td>
                    <td><Badge color="green">Available</Badge></td>
                    <td>
                      <Group spacing="xs">
                        <ActionIcon color="blue" onClick={async () => {
                          try {
                            const { data } = await axios.get(`${API}/api/medical-record/download/${record.id}`, auth);
                            window.open(data, '_blank');
                          } catch (e) {}
                        }}>
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Paper>
      <Paper shadow="sm" p="md" mt="md" withBorder>
        <Stack>
          <Title order={4}>Upload Medical Record</Title>
          <Select placeholder="Select User" data={users.map(u => ({ value: u.id, label: `${u.fullName} (${u.email})` }))} value={selectedUser} onChange={setSelectedUser} style={{ width: 250 }} />
          <Select placeholder="Select Pet" data={users.find(u => u.id === selectedUser)?.pets?.map(p => ({ value: p.id, label: p.name })) || []} value={selectedPet} onChange={setSelectedPet} style={{ width: 200 }} disabled={!selectedUser} />
          <FileInput placeholder="Select File" accept="application/pdf,image/*" value={selectedFile} onChange={setSelectedFile} style={{ width: 200 }} />
          <Button leftSection={<IconUpload size={16} />} onClick={handleUploadRecord} loading={uploading} disabled={!selectedPet || !selectedFile || !selectedUser || !user?.id}>Upload Record</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}

function ClinicPastAppointmentsTab({ clinicId }) {
  return (
    <Card shadow="sm" p="lg" radius="xl" withBorder style={{ minWidth: 700 }}>
      <ClinicPastAppointmentsTable clinicId={clinicId} />
    </Card>
  );
}

export default function VetClinicDashboardPage() {
  const { clinicId } = useParams();
  const [user, setUser] = useState({});
  useEffect(() => {
    
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setUser(data);
      } catch (e) {
        setUser({});
      }
    };
    fetchUser();
  }, []);
  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="lg">Clinic Dashboard</Title>
      <Tabs defaultValue="appointments">
        <Tabs.List>
          <Tabs.Tab value="appointments">Appointments</Tabs.Tab>
          <Tabs.Tab value="records">Medical Records</Tabs.Tab>
          <Tabs.Tab value="history">Past Appointments</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="appointments" pt="xl">
          <AppointmentCalendar type="clinic" id={clinicId} />
        </Tabs.Panel>
        <Tabs.Panel value="records" pt="xl">
          <ClinicMedicalRecordsTab clinicId={clinicId} />
        </Tabs.Panel>
        <Tabs.Panel value="history" pt="xl">
          <ClinicPastAppointmentsTab clinicId={clinicId} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
} 