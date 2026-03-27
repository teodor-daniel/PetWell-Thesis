import { Table } from '@mantine/core';
import axios from 'axios';
import { useEffect, useState } from 'react';

const ClinicCalendar = ({ clinicId, day }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const load = async () => {
      const from = new Date(day); from.setHours(0,0,0,0);
      const to   = new Date(day); to.setHours(23,59,59,999);
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/appointments/clinic/${clinicId}`,
        { params: { from: from.toISOString(), to: to.toISOString() } }
      );
      setRows(data);
    };
    load();
  }, [clinicId, day]);

  return (
    <Table striped highlightOnHover>
      <thead>
        <tr>
          <th>Time</th><th>Vet</th><th>Pet</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td>{new Date(r.appointmentDate).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td>
            <td>{r.vetName ?? r.vetId}</td>
            <td>{r.petName ?? r.petId}</td>
            <td>{r.status}</td>
          </tr>
        ))}
        {!rows.length && <tr><td colSpan={4}>No appointments</td></tr>}
      </tbody>
    </Table>
  );
};

export default ClinicCalendar;
