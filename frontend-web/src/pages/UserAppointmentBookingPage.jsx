/* 
This page is used to book an appointment by a USER for one of their PETS at a clinic.
*/
import {
  Alert,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconBuildingHospital, IconPill, IconScissors, IconStethoscope, IconTestPipe, IconVaccine } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import GlassyBackground from '../components/style/GlassyBackground';

const TYPE_OPTIONS = [
  { value: 'Vaccination', label: 'Vaccination', duration: 15 },
  { value: 'Deworming', label: 'Deworming (internal/external)', duration: 10 },
  { value: 'Sterilization', label: 'Sterilization / Neutering', duration: 60 },
  { value: 'Check-up', label: 'Routine Check-up', duration: 30 },
  { value: 'Blood/urine tests', label: 'Blood & Urine Tests', duration: 45 },
];

const TYPE_DURATIONS = {
  'Vaccination': 15,
  'Deworming': 10,
  'Sterilization': 60,
  'Check-up': 30,
  'Blood/urine tests': 45,
};

const TYPE_ICONS = {
  'Vaccination': <IconVaccine />,
  'Deworming': <IconPill />,
  'Sterilization': <IconScissors />,
  'Check-up': <IconStethoscope />,
  'Blood/urine tests': <IconTestPipe />,
};

const NAVBAR_BLUE = '#228be6';
const GREEN = '#7bc71e';

const UserAppointmentBookingPage = () => {
  const { id: clinicId } = useParams();   
  const navigate = useNavigate();
  const location = useLocation();

  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [petId, setPetId] = useState(null);
  const [vetId, setVetId] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  
  const [lock, setLock] = useState(null); 
  const [lockError, setLockError] = useState(null);
  const [lockLoading, setLockLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  const [clinic, setClinic] = useState(null);
  const [clinicLoading, setClinicLoading] = useState(true);

  const isMobile = useMediaQuery('(max-width: 600px)');


  useEffect(() => {
    const loadClinic = async () => {
      
      const clinicFromState = location.state?.clinic;
      
      if (clinicFromState) {
        setClinic(clinicFromState);
        setClinicLoading(false);
      } else {
        
        try {
          const { data: clinicData } = await axios.get(`${process.env.REACT_APP_API_URL}/clinics/${clinicId}`);
          setClinic(clinicData);
        } catch (err) {
          console.error('Failed to load clinic details:', err);
          
          setClinic({
            id: clinicId,
            name: `Veterinary Clinic`,
            address: 'Clinic details will be available after booking'
          });
        } finally {
          setClinicLoading(false);
        }
      }
    };
    
    loadClinic();
  }, [clinicId, location.state]);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: petData }, { data: vetData }] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/pets/mine`, { withCredentials: true }),
          axios.get(`${process.env.REACT_APP_API_URL}/vets/by-clinic/${clinicId}`),
        ]);
        setPets(petData);
        setVets(vetData);
      } catch (err) {
        setError('Failed to load pets or vets');
      }
    };
    load();
  }, [clinicId]);

  useEffect(() => {
    if (!lock) return;

    const interval = setInterval(() => {
      const remaining = Math.round((new Date(lock.expiresAt) - new Date()) / 1000);
      if (remaining > 0) {
        setCountdown(remaining);
      } else {
        setCountdown(0);
        setLock(null); 
        setError('Your 5-minute reservation has expired. Please select a time slot again.');
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lock]);
  
  
  useEffect(() => {
    return () => {
      if (lock) {
        axios.delete(`${process.env.REACT_APP_API_URL}/appointment-locks/${lock.id}`, { withCredentials: true });
      }
    };
  }, [lock]);

  
  const generateSlots = () => {
    if (!type) return []; 
    const selectedType = TYPE_OPTIONS.find(t => t.value === type) || TYPE_OPTIONS[0];
    const duration = selectedType.duration;
    const start = 9 * 60, end = 17 * 60; 
    const arr = [];
    for (let min = start; min + duration <= end; min += 5) {
      
      if (duration >= 30 && min % 30 !== 0) continue;
      const h = Math.floor(min / 60);
      const m = min % 60;
      arr.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
    return arr;
  };

  
  useEffect(() => {
    if (!vetId || !date || !type) {
      setSlots([]);
      setTime(null); 
      return;
    }
    setSlotsLoading(true);
    setSlotsError(null);
    const dayStart = new Date(date);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23,59,59,999);
    axios.get(`${process.env.REACT_APP_API_URL}/appointments/vet/${vetId}`, {
      params: {
        from: dayStart.toISOString(),
        to: dayEnd.toISOString(),
      },
      withCredentials: true,
    })
      .then(res => {
        const selectedType = TYPE_OPTIONS.find(t => t.value === type) || TYPE_OPTIONS[0];
        const duration = selectedType.duration;
        const taken = res.data.map(a => {
          const d = new Date(a.appointmentDate);
          
          
          let appointmentDuration;
          if (a.status === 'LOCKED') {
            
            const durationMatch = a.notes?.match(/DURATION:(\d+)/);
            appointmentDuration = durationMatch ? parseInt(durationMatch[1]) : duration;
          } else {
            appointmentDuration = durationForType(a.type);
          }
          return { start: d.getHours() * 60 + d.getMinutes(), duration: appointmentDuration };
        });
        const allSlots = generateSlots();
        
        const available = allSlots.filter(s => {
          const [h, m] = s.split(':').map(Number);
          const slotStart = h * 60 + m;
          return !taken.some(t =>
            (slotStart < t.start + t.duration && slotStart + duration > t.start)
          );
        });
        setSlots(available);
        setTime(null); 
      })
      .catch(() => {
        setSlotsError('Could not load time slots');
        setSlots([]);
        setTime(null);
      })
      .finally(() => setSlotsLoading(false));
  }, [vetId, date, type]);

  function durationForType(typeVal) {
    const t = TYPE_OPTIONS.find(t => t.value === typeVal);
    return t ? t.duration : 30;
  }

  
  const handleTimeSelect = async (selectedTime) => {
    setTime(selectedTime);
    setLockLoading(true);
    setError(null);
    setLockError(null);

    const typeObj = TYPE_OPTIONS.find(t => t.value === type);

    try {
      const appointmentTimeISO = new Date(
        date.getFullYear(), date.getMonth(), date.getDate(),
        Number(selectedTime.split(':')[0]), Number(selectedTime.split(':')[1])
      ).toISOString();

      const payload = {
        vetId,
        appointmentTime: appointmentTimeISO,
        durationMinutes: typeObj?.duration || 30,
      };

      const { data: newLock } = await axios.post(`${process.env.REACT_APP_API_URL}/appointment-locks`, payload, { withCredentials: true });
      
      setLock(newLock);
      setCountdown(300); 
    } catch (err) {
      const message = err.response?.data?.message || "Could not reserve this time slot.";
      setLockError(message);
      setLock(null);
      
      
      setDate(new Date(date.getTime())); 
    } finally {
      setLockLoading(false);
    }
  };

  const releaseLockAndFetchSlots = async (newPetId, newVetId, newType, newDate) => {
    
    if (lock) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/appointment-locks/${lock.id}`, { withCredentials: true });
      } catch (e) {}
      setLock(null);
      setCountdown(0);
    }
    
    if (typeof newPetId !== 'undefined') setPetId(newPetId);
    if (typeof newVetId !== 'undefined') setVetId(newVetId);
    if (typeof newType !== 'undefined') setType(newType);
    if (typeof newDate !== 'undefined') setDate(newDate);

    
    const vId = typeof newVetId !== 'undefined' ? newVetId : vetId;
    const d = typeof newDate !== 'undefined' ? newDate : date;
    const t = typeof newType !== 'undefined' ? newType : type;
    if (vId && d && t) {
      setSlotsLoading(true);
      setTime(null);
      
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!petId || !vetId || !date || !time || !type) {
      setError('Please fill in all required fields: Pet, Vet, Appointment Type, Date, and Time.');
      return;
    }
    const iso = new Date(
      date.getFullYear(), date.getMonth(), date.getDate(),
      Number(time.split(':')[0]), Number(time.split(':')[1])
    ).toISOString();

    const payload = {
      petId,
      vetId,
      clinicId,
      appointmentDate: iso,
      notes,
      type,
    };

    setSubmitting(true); setError(null);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/appointments`, payload, {
        withCredentials: true,
      });
      notifications.show({
        title: 'Appointment booked!',
        message: 'Your appointment is pending confirmation from the vet. 🐾',
        color: 'green',
      });
      navigate('/home');
    } catch (err) {
      console.error('Booking failed:', err.response);

      
      
      const errorMessage = err.response?.data?.message || '';
      if (errorMessage.includes('just been booked') || errorMessage.includes('already has an appointment')) {
        setError('This time slot is no longer available. Please select another one.');
        
        
        
        
        setSlotsLoading(true);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        axios.get(`${process.env.REACT_APP_API_URL}/appointments/vet/${vetId}`, {
          params: { from: dayStart.toISOString(), to: dayEnd.toISOString() },
          withCredentials: true,
        }).then(res => {
          const selectedType = TYPE_OPTIONS.find(t => t.value === type) || TYPE_OPTIONS[0];
          const duration = selectedType.duration;
          const taken = res.data.map(a => {
            const d = new Date(a.appointmentDate);
            
            
            let appointmentDuration;
            if (a.status === 'LOCKED') {
              
              const durationMatch = a.notes?.match(/DURATION:(\d+)/);
              appointmentDuration = durationMatch ? parseInt(durationMatch[1]) : duration;
            } else {
              appointmentDuration = durationForType(a.type);
            }
            return { start: d.getHours() * 60 + d.getMinutes(), duration: appointmentDuration };
          });
          const allSlots = generateSlots();
          const available = allSlots.filter(s => {
            const [h, m] = s.split(':').map(Number);
            const slotStart = h * 60 + m;
            return !taken.some(t => (slotStart < t.start + t.duration && slotStart + duration > t.start));
          });
          setSlots(available);
          setTime(available[0] || ''); 
        }).catch(() => {
          setSlotsError('Could not refresh time slots.');
        }).finally(() => {
          setSlotsLoading(false);
        });

      } else {
        
        setError(errorMessage || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (clinicLoading) {
    return (
      <GlassyBackground>
        <Navbar />
        <Container size={isMobile ? "xs" : "sm"} py={isMobile ? "md" : "xl"}>
          <LoadingOverlay visible={true} />
        </Container>
      </GlassyBackground>
    );
  }

  return (
    <GlassyBackground>
      <Navbar />
      <Container size={isMobile ? "xs" : "sm"} py={isMobile ? "md" : "xl"}>
        <LoadingOverlay visible={submitting} />
        

        <Group mb="xl">
          <Button 
            variant="subtle" 
            color="gray"
            onClick={() => navigate('/clinics')}
            leftSection={<IconArrowLeft size={16} />}
            style={{
              transition: 'all 0.2s ease',
              ':hover': { transform: 'scale(1.05)' }
            }}
          >
            Back
          </Button>
        </Group>
        

        <Paper 
          shadow="md" 
          p={isMobile ? "md" : "xl"} 
          radius="lg" 
          withBorder
          style={{ 
            backgroundColor: 'transparent', 
            opacity: 1, 
            border: 'none'
          }}
        >
          {error && (
            <Alert color="red" mb="md" title="Booking Error">
              {error}
            </Alert>
          )}

          <form onSubmit={save}>
            <Stack gap={isMobile ? 24 : 18}>

              {clinic && (
                <Paper 
                  p="md" 
                  radius="md" 
                  withBorder 
                  style={{ 
                    backgroundColor: 'rgba(123, 199, 30, 0.05)', 
                    border: '1px solid rgba(123, 199, 30, 0.2)',
                    marginBottom: isMobile ? 16 : 12
                  }}
                >
                  <Group spacing="md" align="center">
                    <div style={{
                      padding: 12,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(123, 199, 30, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <IconBuildingHospital size={isMobile ? 24 : 20} color={GREEN} />
                    </div>
                    <div>
                      <Text 
                        size={isMobile ? "lg" : "md"} 
                        weight={700} 
                        color={GREEN}
                        style={{ marginBottom: 4 }}
                      >
                        {clinic.name}
                      </Text>
                      <Text 
                        size={isMobile ? "sm" : "xs"} 
                        color="dimmed"
                        style={{ lineHeight: 1.2 }}
                      >
                        {clinic.address}
                      </Text>
                    </div>
                  </Group>
                </Paper>
              )}

              <Select
                label={<span style={{ fontWeight: 700, color: GREEN, fontSize: isMobile ? 20 : 18 }}>Pet</span>}
                placeholder="Select your pet"
                data={pets.map(p => ({ value: p.id, label: p.name }))}
                value={petId}
                onChange={(value) => releaseLockAndFetchSlots(value, undefined, undefined, undefined)}
                required
                size={isMobile ? 'lg' : 'md'}
                styles={{ input: { fontSize: isMobile ? 20 : 18, padding: isMobile ? 18 : 14 } }}
              />

              <Select
                label={<span style={{ fontWeight: 700, color: GREEN, fontSize: isMobile ? 20 : 18 }}>Vet</span>}
                placeholder="Select vet"
                data={vets.map(v => ({ 
                  value: v.id, 
                  label: v.specialities ? `${v.fullName} (${v.specialities})` : v.fullName 
                }))}
                value={vetId}
                onChange={(value) => releaseLockAndFetchSlots(undefined, value, undefined, undefined)}
                required
                size={isMobile ? 'lg' : 'md'}
                styles={{ input: { fontSize: isMobile ? 20 : 18, padding: isMobile ? 18 : 14 } }}
              />

              <Select
                label={<span style={{ fontWeight: 700, color: GREEN, fontSize: isMobile ? 20 : 18 }}>Appointment Type</span>}
                placeholder="Select type"
                data={TYPE_OPTIONS.map(t => ({ value: t.value, label: t.label }))}
                value={type}
                onChange={(value) => releaseLockAndFetchSlots(undefined, undefined, value, undefined)}
                required
                clearable
                mb="xs"
                size={isMobile ? 'lg' : 'md'}
                styles={{ input: { fontSize: isMobile ? 20 : 18, padding: isMobile ? 18 : 14 } }}
              />

              {isMobile ? (
                <Stack gap="xs">
                  <div style={{ width: '100%' }}>
                    <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', fontSize: 20, color: GREEN }}>Day</label>
                    <ReactDatePicker
                      selected={date}
                      onChange={(value) => releaseLockAndFetchSlots(undefined, undefined, undefined, value)}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select date"
                      minDate={new Date()}
                      customInput={
                        <TextInput
                          size={isMobile ? 'lg' : 'md'}
                          styles={{
                            input: {
                              fontSize: 20,
                              padding: 18,
                              width: '100%',
                            },
                          }}
                          required
                        />
                      }
                    />
                  </div>
                  <Select
                    label={<span style={{ fontWeight: 700, fontSize: 20, color: GREEN }}>Time Slot</span>}
                    placeholder="Select time slot"
                    data={slots.map(s => ({ value: s, label: s }))}
                    value={time}
                    onChange={handleTimeSelect}
                    required
                    disabled={slotsLoading || !slots.length || !type}
                    styles={{ input: { fontSize: 20, padding: 18 } }}
                  />
                </Stack>
              ) : (
                <Stack gap="xs">
                  <div style={{ width: '100%' }}>
                    <label style={{ fontWeight: 700, marginBottom: 4, display: 'block', color: GREEN, fontSize: 18 }}>Day</label>
                    <ReactDatePicker
                      selected={date}
                      onChange={(value) => releaseLockAndFetchSlots(undefined, undefined, undefined, value)}
                      dateFormat="dd-MM-yyyy"
                      placeholderText="Select date"
                      minDate={new Date()}
                      customInput={
                        <TextInput
                          size={'md'}
                          styles={{
                            input: {
                              fontSize: 18,
                              padding: 14,
                              width: '100%',
                            },
                          }}
                          required
                        />
                      }
                    />
                  </div>
                  <Select
                    label={<span style={{ fontWeight: 700, color: GREEN, fontSize: 18 }}>Time Slot</span>}
                    placeholder="Select time slot"
                    data={slots.map(s => ({ value: s, label: s }))}
                    value={time}
                    onChange={handleTimeSelect}
                    required
                    disabled={slotsLoading || !slots.length || !type}
                    styles={{ input: { fontSize: 18, padding: 14 } }}
                  />
                </Stack>
              )}

              {lockError && (
                  <Alert color="orange" title="Reservation Failed" onClose={() => setLockError(null)} withCloseButton>
                      {lockError}
                  </Alert>
              )}

              <Textarea
                label={<span style={{ fontWeight: 700, color: GREEN, fontSize: isMobile ? 20 : 18 }}>Notes (optional)</span>}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                minRows={2}
                size={isMobile ? 'lg' : 'md'}
                styles={{ input: { fontSize: isMobile ? 20 : 18, padding: isMobile ? 18 : 14 } }}
              />

              <Group position="center">
                <Button 
                  type="submit" 
                  mt="sm" 
                  size={isMobile ? 'md' : 'sm'}
                  disabled={!lock || !time || submitting}
                  loading={submitting}
                  color="green"
                  radius="xl"
                  style={{
                    minWidth: 160,
                    maxWidth: 200,
                    width: '50%',
                    fontSize: isMobile ? 16 : 14,
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(123, 199, 30, 0.15)",
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 8,
                    paddingBottom: 8,
                    transition: "box-shadow 0.2s, background 0.2s",
                    backgroundColor: (!lock || !time) ? '#adb5bd' : GREEN,
                    '&:hover': {
                      backgroundColor: (!lock || !time) ? '#adb5bd' : '#6ab017'
                    }
                  }}
                >
                  Confirm Booking
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Container>
    </GlassyBackground>
  );
};

export default UserAppointmentBookingPage;
