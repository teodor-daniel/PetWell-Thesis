/*
This page is used to view the home page for a USER.
*/
import {
  Button, Container,
  Group,
  Modal,
  Paper, Stack, Text, Title, Skeleton
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendar, IconPaw, IconAlertCircle, IconUser } from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

import AddPetForm from '../components/forms/AddPetForm';
import GoogleMaps from '../components/maps/GoogleMaps';
import PetCarousel from '../components/pet/PetCarousel';
import QuickBookModal from '../components/QuickBookModal';
import Footer from '../components/style/Footer';
import { AuthContext } from '../contexts/AuthContext';
import GlassyBackground from '../components/style/GlassyBackground';
import Navbar from '../components/navigation/Navbar';
const GREEN = '#7bc71e';
const BLUE = '#2a4365';
const CARD_H = 110;


const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); 
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function Home() {
  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerId, setOwnerId] = useState(null);
  const [addOpen, setAdd] = useState(false);
  const [qbOpen, setQB] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [petClinics, setPetClinics] = useState([]);
  const [petClinicsLoading, setPetClinicsLoading] = useState(false);
  const [petClinicsError, setPetClinicsError] = useState(null);
  const [bookClinic, setBookClinic] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [appointmentsToShow, setAppointmentsToShow] = useState(3);

  const isMobile = useMediaQuery('(max-width: 600px)');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const api = process.env.REACT_APP_API_URL;

  
  useEffect(() => {
    if (!user?.id) return;
    setOwnerId(user.id);
  }, [user?.id]);

  
  useEffect(() => {
    if (!user) return;
    axios.get(`${api}/pets/mine`, {
      withCredentials: true,
    })
      .then(res => setPets(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, [user]);

  
  useEffect(() => {
    if (!user) return;
    axios.get(`${api}/clinics`, {
      withCredentials: true,
    })
      .then(res => setClinics(res.data))
      .catch(console.error);
  }, [user]);

  
  useEffect(() => {
    if (!user || !ownerId) return;
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    const now = new Date();
    const from = now.toISOString();
    const to = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    axios.get(`${api}/appointments/owner/${ownerId}?from=${from}&to=${to}`, {
      withCredentials: true,
    })
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : []))
      .catch(err => setAppointmentsError('Could not load appointments.'))
      .finally(() => setAppointmentsLoading(false));
  }, [user, ownerId]);

  
  useEffect(() => {
    if (!selectedPet || !user) return;
    setPetClinicsLoading(true);
    setPetClinicsError(null);
    axios.get(`${api}/appointments/owner/${ownerId}?from=1970-01-01T00:00:00Z&to=2100-01-01T00:00:00Z`, {
      withCredentials: true,
    })
      .then(res => {
        const appts = Array.isArray(res.data) ? res.data : [];
        
        const petAppts = appts.filter(a => a.petId === selectedPet.id);
        
        const uniqueClinics = [];
        const seen = new Set();
        for (const a of petAppts) {
          if (!seen.has(a.clinicId)) {
            seen.add(a.clinicId);
            const clinic = clinics.find(c => c.id === a.clinicId);
            if (clinic) uniqueClinics.push(clinic);
          }
        }
        setPetClinics(uniqueClinics);
      })
      .catch(() => setPetClinicsError('Could not load clinics for this pet.'))
      .finally(() => setPetClinicsLoading(false));
  }, [selectedPet, clinics, user, ownerId, api]);

  
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

  
  const filteredAppointments = filterAppointments(appointments);
  const displayedAppointments = filteredAppointments.slice(0, appointmentsToShow);
  while (displayedAppointments.length < appointmentsToShow) {
    displayedAppointments.push(null);
  }

  
  const visitedClinicIds = Array.from(new Set(
    filteredAppointments.map(a => a.clinicId).filter(Boolean)
  ));

  
  const clinicExtraInfo = {};
  if (selectedPet && filteredAppointments.length > 0) {
    
    const petAppts = filteredAppointments.filter(a => a.petId === selectedPet.id);
    petClinics.forEach(clinic => {
      
      const apptsAtClinic = petAppts.filter(a => a.clinicId === clinic.id);
      if (apptsAtClinic.length > 0) {
        
        apptsAtClinic.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        const lastAppt = apptsAtClinic[0];
        clinicExtraInfo[clinic.id] = {
          lastVisitDate: lastAppt.appointmentDate ? formatDate(lastAppt.appointmentDate) : 'N/A',
          lastVetName: lastAppt.vetName || 'N/A',
          servicesUsed: [...new Set(apptsAtClinic.map(a => a.type || 'General'))].join(', ')
        };
      } else {
        clinicExtraInfo[clinic.id] = {
          lastVisitDate: 'N/A',
          lastVetName: 'N/A',
          servicesUsed: 'N/A'
        };
      }
    });
  }

  
  const displayedClinics = petClinics.slice(0, 3);
  while (displayedClinics.length < 3) {
    displayedClinics.push(null); 
  }

  const handleCancel = (appointmentId) => {
    setCancelingId(appointmentId);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancelingId) return;
    setCancelLoading(true);
    try {
      await axios.patch(
        `${api}/appointments/${cancelingId}/cancel`,
        {},
        {
          withCredentials: true,
        }
      );
      setAppointments((prev) => prev.map(a => a.id === cancelingId ? { ...a, status: 'CANCELLED' } : a));
      notifications.show({
        title: 'Appointment Cancelled',
        message: 'Your appointment was cancelled. The clinic and vet will be notified.',
        color: 'green',
      });
    } catch (err) {
      notifications.show({
        title: 'Cancellation Failed',
        message: err.response?.data?.message || 'Could not cancel appointment.',
        color: 'red',
      });
    } finally {
      setCancelLoading(false);
      setCancelModalOpen(false);
      setCancelingId(null);
    }
  };

  const filteredPets = useMemo(() => pets.filter(Boolean), [pets]);

  return (
    <GlassyBackground>
      <Navbar />
      <Container size={isMobile ? "xs" : "xl"} py={isMobile ? "md" : "xl"}>
        <Stack spacing={isMobile ? "md" : "xl"} style={{ backgroundColor: 'transparent', opacity: 1, border: 'none' }}>          <Paper
            style={{ backgroundColor: 'transparent', opacity: 1, border: 'none' }}
            p={isMobile ? "md" : "xl"}
            radius="lg"
            withBorder
          >

            {loading ? (
              <Text>Loading pets...</Text>
            ) : pets.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                  leftSection={<IconPaw size={18} />}
                  onClick={() => setAdd(true)}
                  size={isMobile ? 'sm' : 'md'}
                  style={{ background: '#7bc71e', color: '#fff', fontWeight: 700 }}
                >
                  Add Pet
                </Button>
              </div>
            ) : (
              <PetCarousel
                pets={filteredPets}
                onPetChange={setSelectedPet}
                onAddPet={() => setAdd(true)}
              />
            )}
          </Paper>          <Paper shadow="md" p={isMobile ? "md" : "xl"} style={{ opacity: 1, border: 'none' }} radius="lg" withBorder>
            <Title
              order={2}
              mb="md"
              style={{
                color: GREEN,
                textAlign: isMobile ? "center" : "center",
                width: "100%",
              }}
            >
              {selectedPet ? `Clinics Visited by ${selectedPet.name}` : 'Clinics Visited'}
            </Title>
            {petClinicsLoading ? (
              <Stack spacing="md">
                {[0, 1, 2].map(idx => (
                  <Paper key={`clinic-slot-${idx}`} shadow="xs" p="md" radius="md" withBorder style={{ height: CARD_H, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} >
                    <Skeleton height={CARD_H - 20} radius="md" animate />
                  </Paper>
                ))}
              </Stack>
            ) : petClinicsError ? (
              <Text color="red">{petClinicsError}</Text>
            ) : petClinics.length === 0 ? (
              <Text color="dimmed">No clinics found for this pet.</Text>
            ) : (
              <Stack spacing="md">
                {[0, 1, 2].map(idx => {
                  const clinic = displayedClinics[idx];
                  if (!clinic) {
                    return (
                      <Paper key={`clinic-slot-${idx}`} shadow="xs" p={isMobile ? "md" : "xl"} radius="md" withBorder style={{ minHeight: 120, opacity: 0.5 }} />
                    );
                  }
                  const extra = clinicExtraInfo[clinic.id] || {};
                  return (
                    <Paper
                      key={`clinic-slot-${idx}`}
                      shadow="xs"
                      p={isMobile ? "md" : "xl"}
                      radius="md"
                      withBorder
                      style={{
                        minHeight: 120,
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        justifyContent: isMobile ? "center" : "space-between",
                        alignItems: isMobile ? "center" : "center",
                        gap: isMobile ? 8 : 16,
                        textAlign: isMobile ? "center" : "left",
                      }}
                    >
                      <div style={{ width: isMobile ? "100%" : "auto" }}>
                        <Text fw={600} size={isMobile ? "md" : "lg"}>{clinic.name}</Text>
                        <Text size={isMobile ? "sm" : "md"} color="dimmed">{clinic.address}</Text>
                        <Text size={isMobile ? "sm" : "md"} color="dimmed">{clinic.phone}</Text>
                        <Text size={isMobile ? "sm" : "md"} mt={4}>
                          <b>Last Visit:</b> {extra.lastVisitDate || 'N/A'}
                        </Text>
                        <Text size={isMobile ? "sm" : "md"}>
                          <b>Last Vet:</b> {extra.lastVetName || 'N/A'}
                        </Text>
                        <Text size={isMobile ? "sm" : "md"}>
                          <b>Services:</b> {extra.servicesUsed || 'N/A'}
                        </Text>
                      </div>
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMobile ? "center" : "flex-end",
                        justifyContent: "flex-end",
                        height: "100%",
                        minWidth: isMobile ? "100%" : 120,
                        marginTop: isMobile ? 8 : 0,
                      }}>
                        <Button
                          size={isMobile ? "xs" : "sm"}
                          variant="outline"
                          color="green"
                          onClick={() => navigate(`/clinics/${clinic.id}/book`)}
                          style={{ marginTop: isMobile ? 8 : "auto" }}
                        >
                          Book Again
                        </Button>
                      </div>
                    </Paper>
                  );
                })}
                {petClinics.length > 3 && (
                  <Button variant="subtle" size="xs" color={BLUE} onClick={() => {/* TODO: paginate clinics */ }}>
                    See more clinics
                  </Button>
                )}
              </Stack>
            )}
          </Paper>          {ownerId && (
            <Paper shadow="md" p={isMobile ? "md" : "xl"} radius="lg" withBorder>
              <Group position="apart" mb="md" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Title order={2} style={{ color: GREEN, textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>My Appointments</Title>
              </Group>
              <Group position="center" mb="md" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Button
                  size={isMobile ? "md" : "lg"}
                  color="green"
                  radius="xl"
                  leftSection={<IconCalendar size={20} />}
                  style={{
                    fontWeight: 700,
                    fontSize: isMobile ? 16 : 18,
                    boxShadow: "0 2px 8px rgba(123, 199, 30, 0.15)",
                    paddingLeft: 24,
                    paddingRight: 24,
                    marginBottom: 12,
                    transition: "box-shadow 0.2s, background 0.2s",
                  }}
                  onClick={() => navigate('/clinics')}
                  onMouseOver={e => e.currentTarget.style.background = "#6ab017"}
                  onMouseOut={e => e.currentTarget.style.background = ""}
                >
                  Book New Appointment
                </Button>
              </Group>
              {appointmentsLoading ? (
                <Stack spacing="md">
                  {[0, 1, 2].map(idx => (
                    <Paper key={`appt-slot-${idx}`} shadow="xs" p="md" radius="md" withBorder style={{ height: CARD_H, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Skeleton height={CARD_H - 20} radius="md" animate />
                    </Paper>
                  ))}
                </Stack>
              ) : appointmentsError ? (
                <Group spacing="xs" align="center" color="red">
                  <IconAlertCircle size={18} color="red" />
                  <Text color="red">{appointmentsError}</Text>
                </Group>
              ) : filteredAppointments.length === 0 ? (
                <Text color="dimmed">No upcoming appointments.</Text>
              ) : (
                <Stack spacing="md">
                  {displayedAppointments.map((appt, idx) => {
                    if (!appt) {
                      
                      return (
                        <Paper
                          key={`appt-slot-${idx}`}
                          shadow="xs"
                          p={isMobile ? "md" : "xl"}
                          radius="md"
                          withBorder
                          style={{
                            minHeight: 120,
                            opacity: 0.5,
                          }}
                        />
                      );
                    }
                    return (
                      <Paper
                        key={`appt-slot-${idx}`}
                        shadow="xs"
                        p={isMobile ? "md" : "xl"}
                        radius="md"
                        withBorder
                        style={{
                          minHeight: 120,
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          justifyContent: isMobile ? "center" : "space-between",
                          alignItems: isMobile ? "center" : "center",
                          gap: isMobile ? 8 : 16,
                          textAlign: isMobile ? "center" : "left",
                        }}
                      >
                        <div style={{ width: isMobile ? '100%' : 'auto' }}>
                          <Text fw={600} size={isMobile ? "md" : "lg"}>{appt.petName || 'Pet'}</Text>
                          <Text size={isMobile ? "sm" : "md"} color="dimmed">
                            {clinics.find(c => c.id === appt.clinicId)?.name || 'Clinic'}
                          </Text>
                          <Text size={isMobile ? "sm" : "md"} color="dimmed">
                            {formatDateTime(appt.appointmentDate)}
                          </Text>
                          <Text size={isMobile ? "sm" : "md"}>
                            <IconUser size={14} style={{ marginRight: 4 }} />
                            Vet: {appt.vetName || 'N/A'}
                          </Text>
                          <Text size={isMobile ? "sm" : "md"}>
                            <IconPaw size={14} style={{ marginRight: 4 }} />
                            Type: {appt.type || 'General'}
                          </Text>
                        </div>
                        {isMobile ? (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            marginTop: 8,
                            gap: 8,
                          }}>
                            {appt.status === 'CONFIRMED' && (
                              <Button
                                size="xs"
                                color="red"
                                variant="outline"
                                onClick={() => handleCancel(appt.id)}
                                style={{ minWidth: 80 }}
                              >
                                Cancel
                              </Button>
                            )}
                            <div style={{ flex: 1 }} />
                            <Text
                              size={"sm"}
                              color={
                                appt.status === 'CONFIRMED' ? 'green' :
                                  appt.status === 'CANCELLED' ? 'red' :
                                    'orange'
                              }
                              style={{ fontWeight: 600, textTransform: 'capitalize', textAlign: 'right', width: '100%' }}
                            >
                              Status: {appt.status?.toLowerCase()}
                            </Text>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginLeft: 16 }}>
                            <Text
                              size={"md"}
                              color={
                                appt.status === 'CONFIRMED' ? 'green' :
                                  appt.status === 'CANCELLED' ? 'red' :
                                    'orange'
                              }
                              style={{ fontWeight: 600, textTransform: 'capitalize' }}
                            >
                              Status: {appt.status?.toLowerCase()}
                            </Text>
                            {appt.status === 'CONFIRMED' && (
                              <Button
                                size="sm"
                                color="red"
                                variant="outline"
                                onClick={() => handleCancel(appt.id)}
                                style={{ minWidth: 80 }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        )}
                      </Paper>
                    );
                  })}
                  {filteredAppointments.length > appointmentsToShow && (
                    <Button
                      variant="subtle"
                      size="xs"
                      color={BLUE}
                      onClick={() => setAppointmentsToShow(appointmentsToShow + 3)}
                    >
                      See more appointments
                    </Button>
                  )}
                  {filteredAppointments.length > 3 && filteredAppointments.length <= appointmentsToShow && (
                    <Button
                      variant="subtle"
                      size="xs"
                      color="gray"
                      onClick={() => setAppointmentsToShow(3)}
                    >
                      Show less
                    </Button>
                  )}
                </Stack>
              )}
            </Paper>
          )}
        </Stack>        <Modal opened={addOpen} onClose={() => setAdd(false)} title="Add a new pet" centered>
          <AddPetForm
            onClose={() => {
              setAdd(false);
              
              if (user) {
                axios.get(`${api}/pets/mine`, {
                  withCredentials: true,
                })
                  .then(res => setPets(Array.isArray(res.data) ? res.data : []))
                  .catch(console.error);
              }
            }}
          />
        </Modal>
        <Modal
          opened={cancelModalOpen}
          onClose={() => { setCancelModalOpen(false); setCancelingId(null); }}
          title="Cancel Appointment"
          centered
          withCloseButton={!cancelLoading}
        >
          <Text mb="md">Are you sure you want to cancel this appointment? <br />The clinic and vet will be notified.</Text>
          <Group position="right">
            <Button variant="default" onClick={() => { setCancelModalOpen(false); setCancelingId(null); }} disabled={cancelLoading}>
              No, keep it
            </Button>
            <Button color="red" loading={cancelLoading} onClick={confirmCancel}>
              Yes, cancel it
            </Button>
          </Group>
        </Modal>

        <Paper mt="lg" mb="lg" shadow="md" p={isMobile ? "md" : "xl"} radius="lg" withBorder>
          <Title order={2} align="center" mb="md" p={isMobile ? "md" : "xl"} style={{ color: GREEN }}>Map</Title>
          <GoogleMaps
            visitedClinicIds={visitedClinicIds}
            onBookAgain={clinic => setBookClinic(clinic)}
          />
        </Paper>


        <Footer />
      </Container>
    </GlassyBackground>
  );
}
