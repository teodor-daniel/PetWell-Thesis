import { Badge, Modal, Text } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import axios from 'axios';
import { useEffect, useState } from 'react';

const VetCalendar = ({ vetId }) => {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const from = new Date().toISOString();
      const to   = new Date(Date.now() + 30*24*3600*1000).toISOString(); 
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/appointments/vet/${vetId}`,
        { params: { from, to } }
      );
      setEvents(data);
    };
    fetch();
  }, [vetId]);

  const dateHasEvent = (d) =>
    events.some(e => new Date(e.appointmentDate).toDateString() === d.toDateString());

  return (
    <>
      <Calendar
        defaultLevel="month"
        getDayProps={(date) => ({
          onClick: () => {
            const dayEvents = events.filter(
              e => new Date(e.appointmentDate).toDateString() === date.toDateString()
            );
            if (dayEvents.length) setSelected(dayEvents);
          },
          style: dateHasEvent(date) ? { backgroundColor: '#ffe5b4' } : undefined,
        })}
      />

      <Modal opened={!!selected} onClose={() => setSelected(null)} title="Appointments">
        {selected && selected.map(ev => (
          <Badge key={ev.id} fullWidth mb="sm">
            {new Date(ev.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' – '}
            {ev.petName ?? ev.petId}
          </Badge>
        ))}
        {!selected?.length && <Text>No appointments</Text>}
      </Modal>
    </>
  );
};

export default VetCalendar;
