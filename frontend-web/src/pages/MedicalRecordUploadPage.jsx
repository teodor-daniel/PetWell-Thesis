import { Button, Container, FileInput, Paper, Select, Text, Title } from '@mantine/core';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const API = process.env.REACT_APP_API_URL;

const AddMedicalRecord = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get(`${API}/pets/user/${user.id}`, {
          withCredentials: true
        });
        setPets(response.data);
      } catch (err) {
        setError('Failed to load pets');
      }
    };

    const fetchClinics = async () => {
      try {
        const response = await axios.get(`${API}/clinics`, {
          withCredentials: true
        });
        setClinics(response.data);
      } catch (err) {
        setError('Failed to load clinics');
      }
    };

    fetchPets();
    fetchClinics();
  }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPet || !selectedClinic || !file) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('petId', selectedPet);
    formData.append('clinicId', selectedClinic);
    formData.append('isClinic', 'true');
    formData.append('vetId', user.id); 

    try {
      await axios.post(`${API}/api/medical-record/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      navigate('/medical-records'); 
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Title order={2} mb="lg">Add Medical Record</Title>
      
      <Paper shadow="sm" p="lg" withBorder>
        <form onSubmit={handleSubmit}>
          <Select
            label="Select Pet"
            placeholder="Choose a pet"
            data={pets.map(pet => ({ value: pet.id, label: pet.name }))}
            value={selectedPet}
            onChange={setSelectedPet}
            required
            mb="md"
          />

          <Select
            label="Select Clinic"
            placeholder="Choose a clinic"
            data={clinics.map(clinic => ({ value: clinic.id, label: clinic.name }))}
            value={selectedClinic}
            onChange={setSelectedClinic}
            required
            mb="md"
          />

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

export default AddMedicalRecord; 