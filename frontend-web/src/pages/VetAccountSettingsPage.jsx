import { Alert, Button, Center, Container, Loader, Paper, Select, TextInput, Title, MultiSelect } from '@mantine/core';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const GREEN = '#7bc71e';
const BLUE = '#2a4365';

const specialityOptions = [
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'dentistry', label: 'Dentistry' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'neurology', label: 'Neurology' },
  { value: 'oncology', label: 'Oncology' },
  { value: 'ophthalmology', label: 'Ophthalmology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'internal_medicine', label: 'Internal Medicine' },
  { value: 'emergency_critical_care', label: 'Emergency & Critical Care' },
  { value: 'exotic_animal_medicine', label: 'Exotic Animal Medicine' },
  { value: 'anesthesiology', label: 'Anesthesiology' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'preventive_care', label: 'Preventive Care' },
  { value: 'behavioral_medicine', label: 'Behavioral Medicine' },
];


const sanitizeInput = (input) => {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>&"']/g, '')
    .trim();
};

const validateFullName = (name) => {
  const sanitized = sanitizeInput(name);
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
  return {
    isValid: nameRegex.test(sanitized),
    sanitized,
    error: !nameRegex.test(sanitized) ? 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes' : null
  };
};

const validatePhone = (phone) => {
  if (!phone) return { isValid: true, sanitized: '', error: null };
  const sanitized = phone.replace(/[^\d+\-\s()]/g, '');
  const phoneRegex = /^(\+40|0040|0)?[27]\d{8}$/;
  const cleanPhone = sanitized.replace(/[\s\-()]/g, '');
  return {
    isValid: phoneRegex.test(cleanPhone),
    sanitized,
    error: !phoneRegex.test(cleanPhone) ? 'Please enter a valid Romanian phone number' : null
  };
};

const validateSpecialities = (specs) => {
  if (!specs || specs.length === 0) {
    return { isValid: false, error: 'At least one speciality required' };
  }
  return { isValid: true, error: null };
};

export default function VetAccountSettingsPage() {
  const { user, logout, loading: authLoading, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVet = async () => {
      if (!authLoading && user?.id) {
        try {
          const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/vets/${user.id}`, { withCredentials: true });
          setForm({
            id: data.id,
            email: data.email,
            fullName: data.fullName,
            phone: data.phone,
            specialities: data.specialities ? data.specialities.split(',').map(s => s.trim().toLowerCase()) : [],
            clinicId: data.clinicId,
            isActive: data.isActive,
            createdAt: data.createdAt,
          });
        } catch (e) {
          setMessage('Failed to load vet data.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchVet();
  }, [user, authLoading]);

  
  const handleFullNameChange = (e) => {
    const value = e.target.value;
    if (value.length > 50) return;
    const validation = validateFullName(value);
    setForm({ ...form, fullName: validation.sanitized });
    setErrors({ ...errors, fullName: validation.error });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value.length > 20) return;
    const validation = validatePhone(value);
    setForm({ ...form, phone: validation.sanitized });
    setErrors({ ...errors, phone: validation.error });
  };

  const handleSpecialitiesChange = (value) => {
    setForm({ ...form, specialities: value });
    setErrors({ ...errors, specialities: validateSpecialities(value).error });
  };

  const validateForm = () => {
    const newErrors = {};
    const nameValidation = validateFullName(form.fullName);
    if (!nameValidation.isValid) newErrors.fullName = nameValidation.error;
    const phoneValidation = validatePhone(form.phone);
    if (!phoneValidation.isValid) newErrors.phone = phoneValidation.error;
    const specialitiesValidation = validateSpecialities(form.specialities);
    if (!specialitiesValidation.isValid) newErrors.specialities = specialitiesValidation.error;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validateForm()) {
      setMessage('Please fix the errors below');
      return;
    }
    setMessage('');
    const payload = {
      id: form.id,
      email: form.email,
      fullName: sanitizeInput(form.fullName),
      phone: form.phone ? sanitizeInput(form.phone) : null,
      specialities: form.specialities.map(s => {
        const found = specialityOptions.find(opt => opt.value === s);
        return found ? found.label : s;
      }).join(', '),
      clinicId: form.clinicId,
      isActive: form.isActive,
    };
    axios.put(
      `${process.env.REACT_APP_API_URL}/vets/${user.id}`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    )
      .then((response) => {
        setMessage('Updated successfully');
        updateUser(payload);
      })
      .catch((err) => {
        setMessage(`Update failed: ${err.response?.data?.message || err.message}`);
      });
  };

  const handleDelete = () => {
    if (window.confirm('Delete your vet account? This action cannot be undone.')) {
      console.log('Delete button clicked for vet ID:', user.id);
      setDeleting(true);
      axios.delete(`${process.env.REACT_APP_API_URL}/vets/${user.id}`, {
        withCredentials: true
      })
        .then((response) => {
          console.log('Delete successful:', response);
          setMessage('Account deleted successfully. Redirecting...');
          setTimeout(() => {
            logout();
            navigate('/goodbye');
          }, 1200);
        })
        .catch((error) => {
          console.log('Delete error:', error);
          console.log('Error response:', error.response);
          if (error.response?.status === 409) {
            const errorMessage = error.response?.data || 'Cannot delete account: You have pending or accepted bookings.';
            console.log('409 error message:', errorMessage);
            setMessage(errorMessage);
          } else if (error.response?.status === 401 || error.response?.status === 403) {
            setMessage('Session expired or access denied. Logging out...');
            setTimeout(() => {
              logout();
              navigate('/goodbye');
            }, 1200);
          } else {
            setMessage(error.response?.data?.message || 'Deletion failed. Please try again or contact support.');
          }
        })
        .finally(() => setDeleting(false));
    }
  };

  if (authLoading || loading) {
    return (
      <Center style={{ height: '100vh', background: '#f9fdf9' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Container
        size={500}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(75vh - 72px)',
          marginTop: 0,
          marginBottom: 0,
          paddingTop: 36,
        }}
      >
        <Paper style={{ width: '100%', maxWidth: 500, margin: '0 auto', paddingTop: 32, paddingBottom: 32 }} shadow="md" radius="md" p="xl">
          <Title align="center" style={{ color: BLUE, fontWeight: 800, marginBottom: 16, fontFamily: 'Inter, sans-serif' }}>
            Vet Account Settings
          </Title>
          {message && (
            <Alert color={message.toLowerCase().includes('success') ? 'green' : 'red'} mb="md">{message}</Alert>
          )}
          <form onSubmit={e => { e.preventDefault(); handleUpdate(); }}>
            <TextInput
              label="Full Name"
              value={form.fullName || ''}
              onChange={handleFullNameChange}
              required
              size="md"
              radius="md"
              mt="md"
              error={errors.fullName}
              maxLength={50}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: errors.fullName ? 'red' : BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${errors.fullName ? 'red' : BLUE}44` },
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <TextInput
              label="Email"
              value={form.email || ''}
              disabled
              required
              mt="md"
              size="md"
              radius="md"
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.5)',
                  borderColor: BLUE,
                  color: '#666',
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <TextInput
              label="Phone (Optional)"
              value={form.phone || ''}
              onChange={handlePhoneChange}
              mt="md"
              size="md"
              radius="md"
              error={errors.phone}
              maxLength={20}
              placeholder="+40 xxx xxx xxx"
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: errors.phone ? 'red' : BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${errors.phone ? 'red' : BLUE}44` },
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <MultiSelect
              label="Specialities"
              placeholder="Select or type…"
              data={specialityOptions}
              value={form.specialities || []}
              onChange={handleSpecialitiesChange}
              mt="md"
              size="md"
              radius="md"
              error={errors.specialities}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: errors.specialities ? 'red' : BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${errors.specialities ? 'red' : BLUE}44` },
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <Button
              fullWidth
              mt="xl"
              type="submit"
              size="md"
              radius="md"
              disabled={Object.keys(errors).some(key => errors[key])}
              style={{
                background: Object.keys(errors).some(key => errors[key]) ? '#ccc' : GREEN,
                color: '#fff',
                fontWeight: 700,
                boxShadow: '0 2px 8px #7bc71e33',
                transition: 'background 0.2s',
              }}
              sx={{ 
                '&:hover': { 
                  background: Object.keys(errors).some(key => errors[key]) ? '#ccc' : '#5ea314' 
                } 
              }}
            >
              Update
            </Button>
          </form>
          <Button
            fullWidth
            color="red"
            variant="outline"
            mt="md"
            onClick={handleDelete}
            size="md"
            radius="md"
            style={{ fontWeight: 600, borderColor: GREEN, color: GREEN }}
            sx={{ '&:hover': { background: GREEN + '22', borderColor: '#5ea314', color: '#5ea314' } }}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </Paper>
      </Container>
    </div>
  );
} 