import { useEffect, useState } from 'react';
import { Table, TextInput, Button, Group, Pagination, Loader, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import axios from 'axios';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ClinicPastAppointmentsTable.css';

export default function ClinicPastAppointmentsTable({ clinicId }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [petName, setPetName] = useState('');
  const [petOwnerName, setPetOwnerName] = useState('');
  const [dateRange, setDateRange] = useState([
    new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
    new Date()
  ]);
  const [loading, setLoading] = useState(false);

  const getDayStart = date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const getDayEnd = date => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const { data: resp } = await axios.get(
        `${process.env.REACT_APP_API_URL}/appointments/clinic/${clinicId}/past-paged`,
        {
          params: {
            from: getDayStart(dateRange[0]).toISOString(),
            to: getDayEnd(dateRange[1]).toISOString(),
            petName: params.petName !== undefined ? params.petName : petName || undefined,
            petOwnerName: params.petOwnerName !== undefined ? params.petOwnerName : petOwnerName || undefined,
            page: page - 1,
            size: pageSize,
          },
          withCredentials: true,
        }
      );
      setData(resp.content);
      setTotal(resp.totalPages);
    } catch (e) {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clinicId) {
      fetchData();
    }
  }, [clinicId, page, pageSize, dateRange]);

  const handleSearch = () => {
    setPage(1);
    fetchData({ petName, petOwnerName });
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchData({ petName, petOwnerName });
    }
  };

  return (
    <Stack spacing="md" mt="md" mb="md" size="xl" style={{ minWidth: 900, minHeight:  500 }}>
      <Group position="apart" mb="sm" style={{ minWidth: 900 }}>
        <Group size="xl" style={{ minWidth: 900 }} grow>
          <TextInput
            placeholder="Search by pet name"
            value={petName}
            onChange={e => setPetName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ minWidth: 180 }}
          />
          <TextInput
            placeholder="Search by owner name"
            value={petOwnerName}
            onChange={e => setPetOwnerName(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ minWidth: 180 }}
          />
          <Button size="xs" onClick={handleSearch}><IconSearch size={16} /></Button>
          <ReactDatePicker
            selectsRange
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={setDateRange}
            dateFormat="dd-MM-yyyy"
            placeholderText="Select date range"
            className="mantine-TextInput-input"
            required
            style={{ minWidth: 260 }}
            popperClassName="zindex-datepicker"
          />
        </Group>
        <Group>
          <Button size="xs" onClick={() => { setPage(1); fetchData(); }}>Refresh</Button>
        </Group>
      </Group>
      {loading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover withBorder style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Pet</th>
              <th>Owner</th>
              <th>Phone</th>
              <th>Vet</th>
              <th>Status</th>

            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center' }}>No appointments found</td></tr>
            ) : (
              data.map(app => (
                <tr key={app.id}>
                  <td>{new Date(app.appointmentDate).toLocaleString('en-GB')}</td>
                  <td>{app.petName}</td>
                  <td>{app.petOwnerName || '-'}</td>
                  <td>{app.petOwnerPhone || '-'}</td>
                  <td>{app.vetName}</td>
                  <td>{app.status}</td>

                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
      <Group position="right" mt="md">
        <Pagination value={page} onChange={setPage} total={total} />
      </Group>
    </Stack>
  );
} 