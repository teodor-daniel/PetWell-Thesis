
import { Button, Container, FileInput, Group, Paper, Text, Title } from '@mantine/core';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const API = process.env.REACT_APP_API_URL;

const AddAppointmentRecord = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  
  const [appointment, setAppointment] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await axios.get(`${API}/appointments/${appointmentId}`, {
          withCredentials: true
        });
        setAppointment(response.data);
      } catch (err) {
        setError('Failed to load appointment details');
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !appointment) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('petId', appointment.pet.id);
    formData.append('clinicId', appointment.clinic.id);
    formData.append('isClinic', 'true');
    formData.append('vetId', user.id);

    try {
      await axios.post(`${API}/api/medical-record/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      navigate(`/appointments/${appointmentId}`); 
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload medical record');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) {
    return (
      <Container size="md" py="xl">
        <Text>Loading appointment details...</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">Add Medical Record</Title>
      
      <Paper shadow="sm" p="lg" withBorder>
        <Group mb="md">
          <Text weight={500}>Pet:</Text>
          <Text>{appointment.pet.name}</Text>
        </Group>
        <Group mb="md">
          <Text weight={500}>Owner:</Text>
          <Text>{appointment.pet.owner.name}</Text>
        </Group>
        <Group mb="md">
          <Text weight={500}>Clinic:</Text>
          <Text>{appointment.clinic.name}</Text>
        </Group>

        <form onSubmit={handleSubmit}>
          <FileInput
            label="Medical Record File"
            placeholder="Upload file"
            accept="application/pdf,image/*"
            value={file}
            onChange={setFile}
            required
            mb="md"
          />

          {error && (
            <Text color="red" size="sm" mb="md">
              {error}
            </Text>
          )}

          <Button
            type="submit"
            loading={loading}
            fullWidth
          >
            Upload Record
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AddAppointmentRecord; 