
import {
  Alert,
  Button,
  Modal,
  Select,
  Stack,
} from '@mantine/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuickBookModal = ({ opened, onClose, clinic = null, onBook }) => {
  const navigate = useNavigate();

  const [pets,    setPets]    = useState([]);
  const [clinics, setClinics] = useState([]);

  const [petId,    setPetId]    = useState(null);
  const [clinicId, setClinicId] = useState(clinic ? clinic.id : null);
  const [error,    setError]    = useState(null);


  useEffect(() => {
    if (!opened) return;

    const load = async () => {
      try {
        const { data: petData } = await axios.get(
          `${process.env.REACT_APP_API_URL}/pets/mine`,
          { withCredentials: true },
        );
        setPets(petData);
        if (clinic) {
          setClinics([clinic]);
        } else {
          const { data: clinicData } = await axios.get(`${process.env.REACT_APP_API_URL}/clinics`);
          setClinics(clinicData);
        }
        setError(null);
      } catch {
        setError('Failed to load pets or clinics.');
      }
    };

    load();
  }, [opened, clinic]);

  useEffect(() => {
    if (clinic) setClinicId(clinic.id);
  }, [clinic]);

  const handleContinue = () => {
    if (!petId || !clinicId) {
      setError('Please select both pet and clinic.');
      return;
    }
    onClose();
    if (onBook) {
      onBook({ petId, clinicId });
    } else if (clinic) {
      navigate(`/clinics/${clinicId}`);
    } else {
      navigate('/clinics');
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Book Appointment" size="sm">
      {error && (
        <Alert color="red" mb="sm">
          {error}
        </Alert>
      )}

      <Stack>
        <Select
          label="Pet"
          placeholder="Select your pet"
          data={pets.map((p) => ({ value: p.id, label: p.name }))}
          value={petId}
          onChange={setPetId}
          required
        />

        <Select
          label="Clinic"
          placeholder="Select clinic"
          data={clinics.map((c) => ({ value: c.id, label: c.name }))}
          value={clinicId}
          onChange={setClinicId}
          required
          disabled={!!clinic}
        />

        <Button fullWidth onClick={handleContinue}>
          Continue
        </Button>
      </Stack>
    </Modal>
  );
};

export default QuickBookModal;
