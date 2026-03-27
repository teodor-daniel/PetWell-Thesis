
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/big-calendar-overrides.css';

import { Alert, Button, Group, LoadingOverlay, Modal, Select, Stack, Text, Textarea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconCheck, IconDeviceFloppy, IconEdit, IconTrash, IconX, IconVaccine, IconPill, IconScissors, IconStethoscope, IconTestPipe } from '@tabler/icons-react';
import axios from 'axios';
import {
  format,
  getDay,
  parse, startOfWeek,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

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


export default function AppointmentCalendar({
  type, id, clinicFilter = null,
}) {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [clinics, setClinics] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    appointmentDate: null,
    notes: '',
    status: '',
    vetId: '',
  });
  const [askDel, setAskDel] = useState(false);
  const [vetList, setVetList] = useState([]);
  const navigate = useNavigate();

  
  useEffect(() => {
    if (!id || !user) return;                 

    const fetchData = async () => {
      try {
        const now = Date.now();
        const from = new Date(now - 7 * 86_400_000).toISOString(); 
        const to = new Date(now + 90 * 86_400_000).toISOString(); 

        const path =
          type === 'vet' ? `/appointments/vet/${id}` :
          type === 'clinic' ? `/appointments/clinic/${id}` :
          `/appointments/owner/${id}`;          

        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}${path}`,
          {
            params: { from, to },
            withCredentials: true,
          },
        );

        
        const clinicIds = [...new Set(data.map(a => a.clinicId))];
        const clinicPromises = clinicIds.map(clinicId =>
          axios.get(`${process.env.REACT_APP_API_URL}/clinics/${clinicId}`, {
            withCredentials: true,
          })
        );
        const clinicResponses = await Promise.all(clinicPromises);
        const clinicMap = clinicResponses.reduce((acc, response) => {
          acc[response.data.id] = response.data.name;
          return acc;
        }, {});
        setClinics(clinicMap);

        
        const raw = clinicFilter
          ? data.filter(a => a.clinicId === clinicFilter)
          : data;


        setEvents(
          raw.map(a => {
            const start = new Date(a.appointmentDate);
            const duration = TYPE_DURATIONS[a.type] || 30;
            const end = new Date(start.getTime() + duration * 60000);
            return {
              ...a,
              start,
              end,
              title: a.type,
              icon: TYPE_ICONS[a.type],
              petName: a.petName,
              resource: { ...a, start, end, petName: a.petName, type: a.type },
            };
          })
        );
        console.log(raw);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Could not load appointments.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id, user, clinicFilter]);

  
  useEffect(() => {
    if (isEditing && selectedEvent && selectedEvent.resource && selectedEvent.resource.clinicId) {
      axios.get(`${process.env.REACT_APP_API_URL}/vets/by-clinic/${selectedEvent.resource.clinicId}`, {
        withCredentials: true,
      })
        .then(res => {
          setVetList(res.data.map(vet => ({ value: vet.id, label: vet.fullName })));
        })
        .catch(() => setVetList([]));
    }
  }, [isEditing, selectedEvent]);

  const handleConfirm = async (appointmentId) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/appointments/${appointmentId}/confirm`,
        {},
        {
          withCredentials: true,
        }
      );
      setEvents(events.map(event =>
        event.id === appointmentId
          ? { ...event, resource: { ...event.resource, status: 'CONFIRMED' }, status: 'CONFIRMED' }
          : event
      ));
      setSelectedEvent(null);
      navigate('/home');
    } catch (err) {
      console.error('Failed to confirm appointment:', err);
      setError('Failed to confirm appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/appointments/${appointmentId}/cancel`,
        {},
        {
          withCredentials: true,
        }
      );
      setEvents(events.map(event =>
        event.id === appointmentId
          ? { ...event, resource: { ...event.resource, status: 'CANCELLED' }, status: 'CANCELLED' }
          : event
      ));
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      setError('Failed to cancel appointment');
    }
  };

  const handleEdit = (event) => {
    const resource = event.resource || event;
    setSelectedEvent(event);
    setEditForm({
      appointmentDate: resource.appointmentDate ? new Date(resource.appointmentDate) : null,
      notes: resource.notes || '',
      status: resource.status,
      vetId: resource.vetId || '',
    });
    setIsEditing(true);
  };

  const handleDateChange = (date) => {
    if (!date) return;
    setEditForm(prev => ({ 
      ...prev, 
      appointmentDate: date,
      status: 'PENDING' 
    }));
  };

  const handleSave = async () => {
    try {
      const endpoint = (user.role === 'VET' || user.role === 'OWNER') 
        ? `/appointments/${selectedEvent.id}/vet` 
        : `/appointments/${selectedEvent.id}/owner`;
      const payload = {
        appointmentDate: editForm.appointmentDate.toISOString(),
        notes: editForm.notes,
        status: editForm.status,
      };
      if ((user.role === 'VET' || user.role === 'OWNER') && editForm.vetId) {
        payload.vetId = editForm.vetId;
      }
      await axios.patch(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        payload,
        {
          withCredentials: true,
        }
      );
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? {
              ...event,
              start: editForm.appointmentDate,
              end: new Date(editForm.appointmentDate.getTime() + ((TYPE_DURATIONS[editForm.type || event.type] || 30) * 60000)),
              resource: {
                ...event.resource,
                appointmentDate: editForm.appointmentDate.toISOString(),
                notes: editForm.notes,
                status: editForm.status,
                vetId: editForm.vetId || event.resource.vetId,
                vetName: vetList.find(v => v.value === editForm.vetId)?.label || event.resource.vetName,
              }
            }
          : event
      ));
      setIsEditing(false);
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to update appointment:', err);
      setError('Failed to update appointment');
    }
  };

  const deleteEvt = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/appointments/${selectedEvent.id}`, {
        withCredentials: true,
      });
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setSelectedEvent(null);
      setAskDel(false);
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      if (err.response?.status === 403) {
        setError('You don\'t have permission to delete this appointment');
      } else if (err.response?.status === 400) {
        setError('Cannot delete completed appointments');
      } else {
        setError('Failed to delete appointment. Please try again.');
      }
    }
  };

  const eventStyleGetter = useMemo(() => (evt) => ({
    style: {
      backgroundColor:
        evt.resource?.status === 'CANCELLED' ? '#f87171' : 
        evt.resource?.status === 'CONFIRMED' ? '#34d399' : 
        '#fbbf24', 
      borderRadius: 10,
      color: '#222',
      border: '2px solid #fff',
      display: 'block',
      zIndex: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      minHeight: 60,
      fontSize: '1.08em',
      padding: '8px 12px',
      fontWeight: 500,
    },
  }), []);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 'auto',
        maxWidth: '100%',
        margin: '40px auto',
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        width: '100%',
        boxSizing: 'border-box',
      }}
      className="calendar-card-responsive"
    >
      <LoadingOverlay visible={loading} />
      {error && <Alert color="red" mb="sm">{error}</Alert>}

      <div style={{ width: '100%', overflowX: 'auto' }}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="week"
        views={['day', 'week', 'agenda']}
        step={15}
        timeslots={6}
        dayLayoutAlgorithm="no-overlap"
        style={{
          height: '70vh',
          width: '100%',
          minWidth: 320,
          maxWidth: '100%',
        }}
        min={new Date(1970, 1, 1, 9, 0)}
        max={new Date(1970, 1, 1, 20, 0)}
        eventPropGetter={eventStyleGetter}
        messages={{
          noEventsInRange: 'No appointments',
          agenda: 'Agenda',
          day: 'Day',
          week: 'Week'
        }}
        onSelectEvent={(event) => handleEdit(event)}
        components={{
          event: ({ event }) => {
            const resource = event.resource || event;
            return (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 8, height: '100%',
                flexDirection: 'column', justifyContent: 'center', textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  {TYPE_ICONS[resource.type] || <IconStethoscope />}
                  <span style={{ fontWeight: 700 }}>{resource.type}</span>
                </div>
                <div style={{ fontSize: '0.95em', color: '#555' }}>{resource.petName}</div>
              </div>
            );
          },
          agenda: {
            event: ({ event }) => {
              const resource = event.resource || event;
              return (
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: 8, height: '100%',
                  flexDirection: 'column', justifyContent: 'center', textAlign: 'center',
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  padding: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
                    {TYPE_ICONS[resource.type] || <IconStethoscope />}
                    <span style={{ fontWeight: 700 }}>{resource.type}</span>
                  </div>
                  <div style={{ fontSize: '0.95em', color: '#555' }}>{resource.petName}</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>Owner: {resource.petOwnerName || 'N/A'}</div>
                  {resource.petOwnerPhone && (
                    <div style={{ fontSize: '0.85em', color: '#777' }}>{resource.petOwnerPhone}</div>
                  )}
                  {resource.vetName && (
                    <div style={{ fontSize: '0.85em', color: '#777' }}>Vet: {resource.vetName}</div>
                  )}
                  <div style={{ fontSize: '0.9em', color: '#888' }}>{resource.appointmentDate ? format(new Date(resource.appointmentDate), 'dd-MM-yyyy HH:mm') : ''}</div>
                </div>
              );
            }
          }
        }}
      />
      </div>

      <Modal
        opened={!!selectedEvent}
        onClose={() => {
          setSelectedEvent(null);
          setIsEditing(false);
        }}
        title="Appointment Details"
      >
        {selectedEvent && (
          <Stack spacing="md">
           
            <Text><strong>Pet Owner:</strong> {selectedEvent.resource.petOwnerName || 'N/A'}</Text>
            {selectedEvent.resource.petOwnerPhone && (
              <Text><strong>Owner Phone:</strong> {selectedEvent.resource.petOwnerPhone}</Text>
            )}
            {isEditing ? (
              <>
                <DateTimePicker
                  label="Appointment Date"
                  value={editForm.appointmentDate}
                  onChange={handleDateChange}
                  clearable={false}
                />
                <Textarea
                  label="Notes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  minRows={3}
                />

                {(user.role === 'VET' || user.role === 'OWNER') && (
                  <Select
                    label="Vet"
                    data={vetList}
                    value={editForm.vetId}
                    onChange={value => setEditForm(prev => ({ ...prev, vetId: value }))}
                    placeholder="Select vet"
                    searchable
                    nothingFound="No vets"
                    required
                  />
                )}
                <Select
                  label="Status"
                  value={editForm.status}
                  onChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                  data={[
                    { value: 'PENDING', label: 'Pending' },
                    { value: 'CONFIRMED', label: 'Confirmed' },
                    { value: 'CANCELLED', label: 'Cancelled' }
                  ]}
                />
                <Group position="right" mt="md">
                  <Button
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={() => setAskDel(true)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="light"
                    color="gray"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="light"
                    color="blue"
                    leftSection={<IconDeviceFloppy size={16} />}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </Group>
              </>
            ) : (
              <>
                <Text><strong>Pet:</strong> {selectedEvent.resource.petName}</Text>
                <Text><strong>Clinic:</strong> {clinics[selectedEvent.resource.clinicId] || 'Unknown Clinic'}</Text>
              
                <Text><strong>Vet:</strong> {selectedEvent.resource.vetName || selectedEvent.resource.vetId || 'N/A'}</Text>
                {type === 'clinic' && (
                  <Text><strong>Vet:</strong> {selectedEvent.resource.vetName || selectedEvent.resource.vetId || 'N/A'}</Text>
                )}
                <Text><strong>Date:</strong> {new Date(selectedEvent.resource.appointmentDate).toLocaleString()}</Text>
                <Text><strong>Status:</strong> {selectedEvent.resource.status}</Text>
                {selectedEvent.resource.notes && (
                  <Text><strong>Notes:</strong> {selectedEvent.resource.notes}</Text>
                )}
                <Group position="right" mt="md">
                  {selectedEvent.resource.status === 'Scheduled' && (
                    <>
                      {type === 'vet' && (
                        <>
                          <Button
                            variant="light"
                            color="red"
                            leftSection={<IconX size={16} />}
                            onClick={() => handleCancel(selectedEvent.id)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="light"
                            color="green"
                            leftSection={<IconCheck size={16} />}
                            onClick={() => handleConfirm(selectedEvent.id)}
                          >
                            Confirm
                          </Button>
                        </>
                      )}
                      <Button
                        variant="light"
                        color="blue"
                        leftSection={<IconEdit size={16} />}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </Group>
              </>
            )}
          </Stack>
        )}
      </Modal>


      <Modal opened={askDel} onClose={() => setAskDel(false)} title="Delete appointment?">
        <Stack spacing="md">
          <Text size="lg">Are you sure you want to delete this appointment?</Text>
          <Text size="sm" c="dimmed">This action cannot be undone.</Text>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setAskDel(false)}>Cancel</Button>
            <Button color="red" onClick={deleteEvt}>Delete</Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
}
