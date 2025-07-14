
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Container,
  FileInput,
  Group,
  Loader,
  Modal,
  MultiSelect,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendar, IconDownload, IconFileText, IconHistory, IconPlus, IconSearch, IconSettings, IconUpload, IconUsers } from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppointmentCalendar from '../components/AppointmentCalendar';
import ClinicPastAppointmentsTable from '../components/clinic/ClinicPastAppointmentsTable';
import VetCard from '../components/vet/VetCard';
import { AuthContext } from '../contexts/AuthContext';

const API = process.env.REACT_APP_API_URL;

const SPECIALITY_OPTIONS = [
  'Dermatology','Surgery','Dentistry','Cardiology','Neurology',
  'Oncology','Ophthalmology','Orthopedics','Internal Medicine',
  'Emergency & Critical Care','Exotic Animal Medicine','Anesthesiology',
  'Radiology','Preventive Care','Behavioral Medicine',
];

const localizer = momentLocalizer(require('moment'));

export default function ClinicPage() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { state } = useLocation();
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  
  const [ownerClinics, setOwnerClinics] = useState(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const clinicId = clinic?.id;
  const clinicName = clinic?.name ?? slug.replace(/-/g, ' ');


  const [vets, setVets] = useState([]);
  const [loadingVets, setLoadingVets] = useState(true);


  const [editOpen, setEdit] = useState(false);
  const [editingVet, setEV] = useState(null);

  const form = useForm({
    initialValues: { fullName: '', email: '', phone: '', specialities: [] },
    validate: {
      fullName: v => (!v ? 'Name required' : null),
      email: v => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
      phone: v => (!v ? 'Phone required' : null),
      specialities: v => (v.length ? null : 'Select at least one'),
    },
  });


  const [linkOpen, setLink] = useState(false);
  const [searching, setBusy] = useState(false);
  const [options, setOps] = useState([]); 
  const [selected, setSel] = useState([]); 
  const debounce = useRef(null);

  
  const [petNameFilter, setPetNameFilter] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');
  const [filteredMedicalRecords, setFilteredMedicalRecords] = useState([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);


  const auth = { withCredentials: true };

  const loadVets = async () => {
    if (!clinicId) return;
    setLoadingVets(true);
    try {
      const { data } = await axios.get(`${API}/vets/by-clinic/${clinicId}`, auth);
      setVets(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load vets');
    } finally {
      setLoadingVets(false);
    }
  };


  const fetchVets = async q =>{
    if(!q.trim()){ setOps([]); return; }
    setBusy(true);
    try{
      const { data } = await axios.get(`${API}/vets/search`,{
        params:{ query:q, excludeClinicId:clinicId, limit:20 }, ...auth
      });
      setOps(prev=>{
        const keep = prev.filter(o=>selected.includes(o.value));
        const fresh = data.map(v=>({value:v.id,label:`${v.fullName} (${v.email})`}));
        return [...keep, ...fresh];
      });
    }catch(e){ console.error(e); toast.error('Search failed'); }
    finally{ setBusy(false); }
  };

  const handleSearch = q =>{
    clearTimeout(debounce.current);
    debounce.current = setTimeout(()=>fetchVets(q),250);
  };

  const linkVets = async ()=>{
    if(!selected.length) return;
    try{
      await Promise.all(selected.map(vetId=>
        axios.post(`${API}/vet-clinic-memberships`,null,
          { params:{ vetId, clinicId }, ...auth })
      ));
      toast.success('Vet(s) linked');
      setLink(false); setSel([]); setOps([]); loadVets();
    }catch(e){ console.error(e); toast.error('Link failed'); }
  };

  const unlinkVet = async vetId=>{
    if(!window.confirm('Remove this vet from this clinic?')) return;
    try{
      await axios.delete(`${API}/vet-clinic-memberships`,
        { params:{ vetId, clinicId }, ...auth });
      toast.success('Vet removed'); loadVets();
    }catch(e){ console.error(e); toast.error('Remove failed'); }
  };


  const saveEdit = async vals=>{
    const payload={ ...vals, clinicId,
      specialities:vals.specialities.join(', ') };
    try{
      await axios.put(`${API}/vets/${editingVet.id}`,payload,auth);
      toast.success('Vet updated'); setEdit(false); loadVets();
    }catch(e){
      console.error(e);
      toast.error(e.response?.data?.message || 'Update failed');
    }
  };

  const [userAppointments, setUserAppointments] = useState([]);
  const [loadingUserAppointments, setLoadingUserAppointments] = useState(false);

  
  useEffect(() => {
    if (user?.role !== 'USER' || !clinicId) return;
    setLoadingUserAppointments(true);
    axios.get(`${API}/appointments/owner/${user.id}`, {
      withCredentials: true,
      params: { clinicId },
    })
      .then(res => setUserAppointments(res.data))
      .catch(() => setUserAppointments([]))
      .finally(() => setLoadingUserAppointments(false));
  }, [user?.role, clinicId, user?.id]);

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      console.error('Failed to load confirmed appointments medical records:', e);
      try {
        
        const params = new URLSearchParams();
        if (filters.petName) params.append('petName', filters.petName);
        if (filters.uploaderName) params.append('uploaderName', filters.uploaderName);
        if (filters.fileName) params.append('fileName', filters.fileName);

        const { data } = await axios.get(`${API}/api/medical-record/clinic/${clinicId}/all?${params}`, auth);
        setMedicalRecords(data);
        setFilteredMedicalRecords(data); 
      } catch (fallbackError) {
        console.error('Failed to load all medical records:', fallbackError);
        toast.error('Failed to load medical records');
        setMedicalRecords([]);
        setFilteredMedicalRecords([]);
      }
    } finally {
      setLoadingRecords(false);
    }
  };

  
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

  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
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
          
          fetchMedicalRecords({});
        }
      }
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [petNameFilter, uploaderFilter, fileTypeFilter]);

  const handleUploadRecord = async () => {
    if (!selectedPet || !selectedFile) {
      toast.error('Please select a pet and file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('petId', selectedPet);
    formData.append('isClinic', 'true');
    formData.append('clinicId', clinicId);
    
    
    if (user.role === 'OWNER') {
      formData.append('uploaderId', user.id);
    } else if (user.role === 'VET') {
      formData.append('vetId', user.id);
    }
    

    try {
      await axios.post(`${API}/api/medical-record/upload`, formData, {
        headers: { 
          ...auth.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Record uploaded successfully');
      setSelectedFile(null);
      setSelectedPet(null);
      setSelectedUser(null);
      fetchMedicalRecords();
    } catch (e) {
      console.error(e);
      toast.error('Failed to upload record');
    } finally {
      setUploading(false);
    }
  };

  const [pastAppointments, setPastAppointments] = useState([]);
  const [loadingPastAppointments, setLoadingPastAppointments] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchUsers = async () => {
    if (!clinicId) return;
    setLoadingUsers(true);
    try {
      const { data } = await axios.get(`${API}/users/clinic/${clinicId}/confirmed-users`, auth);
      setUsers(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchPastAppointments = async () => {
    if (!dateRange[0] || !dateRange[1]) return;
    
    setLoadingPastAppointments(true);
    try {
      const { data } = await axios.get(`${API}/appointments/clinic/${clinicId}/past`, {
        params: {
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString()
        },
        ...auth
      });
      setPastAppointments(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load past appointments');
    } finally {
      setLoadingPastAppointments(false);
    }
  };


  const [activeTab, setActiveTab] = useState('schedule');

  
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingVetsTab, setLoadingVetsTab] = useState(false);
  const [loadingRecordsTab, setLoadingRecordsTab] = useState(false);
  const [loadingHistoryTab, setLoadingHistoryTab] = useState(false);

  
  useEffect(() => {
    if (!clinicId) return;
    if (activeTab === 'schedule') {
      setLoadingSchedule(true);
      
      setLoadingSchedule(false);
    }
    if (activeTab === 'vets') {
      setLoadingVetsTab(true);
      loadVets().finally(() => setLoadingVetsTab(false));
    }
    if (activeTab === 'records') {
      setLoadingRecordsTab(true);
      fetchMedicalRecords().finally(() => setLoadingRecordsTab(false));
    }
    if (activeTab === 'history') {
      
      if (dateRange[0] && dateRange[1]) {
        setLoadingHistoryTab(true);
        fetchPastAppointments().finally(() => setLoadingHistoryTab(false));
      }
    }
  }, [activeTab, clinicId]);

  
  useEffect(() => {
    if (activeTab === 'records' && clinicId) {
      fetchUsers();
    }
  }, [activeTab, clinicId]);

  
  useEffect(() => {
    if (user?.role !== 'OWNER') return;
    const fetchOwnerClinics = async () => {
      try {
        const { data } = await axios.get(`${API}/clinics/mine`, {
          withCredentials: true,
        });
        setOwnerClinics(data);
        
        if (clinicId && !data.some(c => c.id === clinicId)) {
          toast.error('You are not authorized to view this clinic.');
          navigate('/dashboard', { replace: true });
        }
      } catch (e) {
        setOwnerClinics([]);
        toast.error('Failed to verify clinic access.');
        navigate('/dashboard', { replace: true });
      } finally {
        setCheckingAccess(false);
      }
    };
    if (clinicId) fetchOwnerClinics();
    else setCheckingAccess(false);
  }, [user?.role, clinicId, navigate]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    axios.get(`${API}/clinics/${slug}`, {
      withCredentials: true,
    })
      .then(res => {
        setClinic(res.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        if (err.response?.status === 403) {
          toast.error('You are not authorized to view this clinic.');
        } else if (err.response?.status === 400) {
          toast.error('Invalid clinic link.');
        } else {
          toast.error('Clinic not found.');
        }
        navigate('/dashboard', { replace: true });
      });
  }, [slug, navigate]);

  if (checkingAccess) {
    return (
      <Container size="lg" py="xl">
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack spacing="xl">
 
        <Group position="apart" align="flex-start">
          <Stack spacing={0}>
            <Title order={2}>{clinicName}</Title>
            <Text color="dimmed">{clinic?.address}</Text>
          </Stack>
        </Group>        {(user.role === 'VET' || user.role === 'OWNER') ? (
          <Tabs value={activeTab} onChange={setActiveTab} defaultValue="schedule">
            <Tabs.List>
              <Tabs.Tab value="schedule" icon={<IconCalendar size={14} />}>
                Schedule
              </Tabs.Tab>
              <Tabs.Tab value="vets" icon={<IconUsers size={14} />}>
                Veterinarians
              </Tabs.Tab>
              <Tabs.Tab value="records" icon={<IconFileText size={14} />}>
                Medical Records
              </Tabs.Tab>
              <Tabs.Tab value="history" icon={<IconHistory size={14} />}>
                Past Appointments
              </Tabs.Tab>
              {user.role === 'OWNER' && (
                <Tabs.Tab value="settings" icon={<IconSettings size={14} />}>
                  Clinic Settings
                </Tabs.Tab>
              )}
            </Tabs.List>

            <Tabs.Panel value="schedule" pt="xl">
              <Paper shadow="sm" p="lg" radius="md" withBorder>
                <Stack spacing="md">
                  <Group position="apart">
                    <Title order={3}>Clinic Schedule</Title>
                  </Group>
                  <AppointmentCalendar type="clinic" id={clinicId} />
                </Stack>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="vets" pt="xl">
              <Stack spacing="md">
                <Group position="apart">
                  <Title order={3}>Our Veterinarians</Title>
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={() => setLink(true)}
            >
              Add Vet
            </Button>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                  {vets.map((vet) => (
                    <VetCard
                      key={vet.id}
                      vet={vet}
                      onDelete={() => unlinkVet(vet.id)}
                      showActions={user.role === 'OWNER'}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="records" pt="xl">
              <Stack spacing="md">
                <Paper shadow="sm" p="md" withBorder>
                  <Stack spacing="md">
                    <Title order={4}>Filters</Title>
                    <Group grow>
                      <TextInput
                        placeholder="Filter by pet name..."
                        value={petNameFilter}
                        onChange={(e) => setPetNameFilter(e.target.value)}
                        leftSection={<IconSearch size={16} />}
                      />
                      <TextInput
                        placeholder="Filter by uploader..."
                        value={uploaderFilter}
                        onChange={(e) => setUploaderFilter(e.target.value)}
                        leftSection={<IconSearch size={16} />}
                      />
                      <TextInput
                        placeholder="Filter by file type..."
                        value={fileTypeFilter}
                        onChange={(e) => setFileTypeFilter(e.target.value)}
                        leftSection={<IconSearch size={16} />}
                      />
                    </Group>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPetNameFilter('');
                        setUploaderFilter('');
                        setFileTypeFilter('');
                        fetchMedicalRecords({});
                      }}
                    >
                      Clear Filters
                    </Button>
                  </Stack>
                </Paper>

                <Paper shadow="sm" p="lg" withBorder>
                  {loadingRecords ? (
                    <Center py="xl">
                      <Loader />
                    </Center>
                  ) : filteredMedicalRecords.length === 0 ? (
                    <Text color="dimmed" align="center">
                      {medicalRecords.length === 0 ? 'No medical records found' : 'No records match the current filters'}
                    </Text>
                  ) : (
                    <>
                      <Group position="apart" mb="md">
                        <Text size="sm" color="dimmed">
                          Showing {getUniqueRecords(filteredMedicalRecords).length} of {getUniqueRecords(medicalRecords).length} records
                        </Text>
                      </Group>
                      <Table>
                        <thead>
                          <tr>
                            <th>Pet Name</th>
                            <th>File Name</th>
                            <th>Uploaded By</th>
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
                              <td>{record.uploaderUserName || record.vetName || 'Unknown'}</td>
                              <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                              <td>
                                <Badge color="green">
                                  Available
                                </Badge>
                              </td>
                              <td>
                                <Group spacing="xs">
                                  <ActionIcon
                                    color="blue"
                                    onClick={async () => {
                                      try {
                                        const { data } = await axios.get(
                                          `${API}/api/medical-record/download/${record.id}`,
                                          auth
                                        );
                                        
                                        window.open(data, '_blank');
                                      } catch (e) {
                                        toast.error('Failed to download file');
                                      }
                                    }}
                                  >
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
                    <Select
                      placeholder="Select User"
                      data={users.map(u => ({
                        value: u.id,
                        label: `${u.fullName} (${u.email})`
                      }))}
                      value={selectedUser}
                      onChange={setSelectedUser}
                      style={{ width: 250 }}
                    />
                    <Select
                      placeholder="Select Pet"
                      data={users
                        .find(u => u.id === selectedUser)?.pets?.map(p => ({
                          value: p.id,
                          label: p.name
                        })) || []}
                      value={selectedPet}
                      onChange={setSelectedPet}
                      style={{ width: 200 }}
                      disabled={!selectedUser}
                    />
                    <FileInput
                      placeholder="Select File"
                      accept="application/pdf,image/*"
                      value={selectedFile}
                      onChange={setSelectedFile}
                      style={{ width: 200 }}
                    />
                    <Button
                      leftSection={<IconUpload size={16} />}
                      onClick={handleUploadRecord}
                      loading={uploading}
                      disabled={!selectedPet || !selectedFile || !selectedUser}
                    >
                      Upload Record
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="history" pt="xl">
              <Paper shadow="sm" p="lg" radius="md" withBorder>
                <Stack spacing="md">
                  <Group position="apart">
                    <Title order={3}>Past Appointments</Title>
                  </Group>
                  {clinicId ? (
                    <ClinicPastAppointmentsTable clinicId={clinicId} />
                  ) : (
                    <Text color="dimmed" align="center">Loading clinic data...</Text>
                  )}
                </Stack>
              </Paper>
            </Tabs.Panel>

            {user.role === 'OWNER' && (
              <Tabs.Panel value="settings" pt="xl">
                <Paper shadow="sm" p="lg" radius="md" withBorder>
                  <Stack spacing="md">
                    <Title order={3}>Clinic Settings</Title>
                    {clinic ? (
                      <ClinicSettingsForm clinic={clinic} onUpdate={setClinic} />
                    ) : (
                      <Text color="dimmed">Loading clinic data...</Text>
                    )}
                  </Stack>
                </Paper>
              </Tabs.Panel>
            )}
          </Tabs>
        ) : (
          
          <>
        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Stack spacing="md">
            <Group position="apart">
              <Title order={3}>Clinic Schedule</Title>
                <Button
                  leftSection={<IconCalendar size={16} />}
                  onClick={() => navigate(`/clinics/${clinicId}/book`)}
                >
                  Book Appointment
                </Button>
            </Group>
              <Stack>
                {loadingUserAppointments ? (
                  <Text>Loading your appointments...</Text>
                ) : userAppointments.length === 0 ? (
                  <Text color="dimmed">You have no appointments at this clinic.</Text>
                ) : (
                  userAppointments.map(app => (
                    <Paper key={app.id} p="md" withBorder>
                      <Group position="apart">
                        <Stack spacing={0}>
                          <Text fw={500}>{app.petName || `Pet ID: ${app.petId}`}</Text>
                          <Text size="sm" color="dimmed">
                            {new Date(app.appointmentDate).toLocaleString([], {
                              year: 'numeric', month: 'long', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </Text>
                          <Text size="sm">Vet: {app.vetName || app.vetId}</Text>
                        </Stack>
                        <Text size="sm" color={app.status === 'CONFIRMED' ? 'green' : 'orange'}>
                          {app.status}
                        </Text>
                      </Group>
                    </Paper>
                  ))
                )}
              </Stack>
          </Stack>
        </Paper>
          </>
        )}
      </Stack>      <Modal
        opened={editOpen}
        onClose={() => {
          setEdit(false);
          setEV(null);
          form.reset();
        }}
        title={editingVet ? 'Edit Vet' : 'Add New Vet'}
        size="md"
      >
        <Box component="form" onSubmit={form.onSubmit(saveEdit)}>
          <Stack>
            <TextInput label="Full name"   withAsterisk {...form.getInputProps('fullName')}/>
            <TextInput label="Email" type="email" withAsterisk {...form.getInputProps('email')}/>
            <TextInput label="Phone"       withAsterisk {...form.getInputProps('phone')}/>
            <MultiSelect
              label="Specialities"
              data={SPECIALITY_OPTIONS}
              searchable clearable withAsterisk
              {...form.getInputProps('specialities')}
            />
          </Stack>
          <Group mt="lg" justify="flex-end">
            <Button variant="default" onClick={()=>setEdit(false)}>Cancel</Button>
            <Button type="submit">Save changes</Button>
          </Group>
        </Box>
      </Modal>      <Modal
        opened={linkOpen}
        onClose={() => setLink(false)}
        title="Link Existing Vet"
        size="md"
      >
        <Stack>
          <MultiSelect
            data={options}
            value={selected}
            onChange={setSel}
            onSearchChange={handleSearch}
            searchable clearable
            placeholder="Type name or email"
            nothingFound="No vets"
            rightSection={searching ? <Loader size="xs" /> : null}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={()=>setLink(false)}>Cancel</Button>
            <Button disabled={!selected.length} onClick={linkVets}>Link selected</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

function ClinicSettingsForm({ clinic, onUpdate }) {
  const [form, setForm] = useState({
    name: clinic.name || '',
    address: clinic.address || '',
    phone: clinic.phone || '',
    city: clinic.city || '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setForm({
      name: clinic.name || '',
      address: clinic.address || '',
      phone: clinic.phone || '',
      city: clinic.city || '',
    });
  }, [clinic]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const { data } = await axios.put(
        `${API}/clinics/${clinic.id}`,
        form,
        { withCredentials: true }
      );
      setSuccess(true);
      onUpdate(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update clinic');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClinic = async () => {
    setDeleteLoading(true);
    setError('');
    try {
      await axios.delete(`${API}/clinics/${clinic.id}`, {
        withCredentials: true
      });
      toast.success('Clinic deleted successfully');
      
      window.location.href = '/dashboard';
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete clinic';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing="md">
        <TextInput
          label="Clinic Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <TextInput
          label="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
          required
        />
        <TextInput
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          required
        />
        <TextInput
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
        />
        {error && <Text color="red">{error}</Text>}
        {success && <Text color="green">Clinic updated successfully!</Text>}
        <Group justify="space-between">
          <Button type="submit" loading={loading} color="green">
            Save Changes
          </Button>
          <Button 
            type="button" 
            color="red" 
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Clinic
          </Button>
        </Group>
      </Stack>      <Modal
        opened={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Clinic"
        size="md"
      >
        <Stack spacing="md">
          <Text>
            Are you sure you want to delete <strong>{clinic.name}</strong>? This action cannot be undone.
          </Text>
          <Text size="sm" color="dimmed">
            Note: You can only delete a clinic if it has no linked veterinarians and no future confirmed appointments.
          </Text>
          <Group justify="flex-end">
            <Button 
              variant="default" 
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              loading={deleteLoading}
              onClick={handleDeleteClinic}
            >
              Delete Clinic
            </Button>
          </Group>
        </Stack>
      </Modal>
    </form>
  );
}


function getUniqueRecords(records) {
  const seen = new Set();
  return records.filter(record => {
    const key = `${record.petId}-${record.fileName}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}