import { Alert, Button, Center, Container, Loader, Select, TextInput, Title } from '@mantine/core';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import GlassyBackground from '../components/style/GlassyBackground';
import GlassyCard from '../components/style/GlassyCard';
import { AuthContext } from '../contexts/AuthContext';

const GREEN = '#7bc71e';
const BLUE = '#2a4365';

const cityOptions = [
  { value: 'Bucuresti', label: ' București' },
  { value: 'Iasi', label: ' Iași' },
  { value: 'Constanta', label: ' Constanța' },
  { value: 'Craiova', label: ' Craiova' },
  { value: 'Brasov', label: ' Brașov' },
  { value: 'Galati', label: ' Galați' },
  { value: 'Ploiesti', label: ' Ploiești' },
  { value: 'Pitesti', label: 'Pitești' },
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
  const phoneRegex = /^(\+40|0040|0)?[27]\d{8}$|^(\+40|0040|0)?[37]\d{8}$/;
  const cleanPhone = sanitized.replace(/[\s\-()]/g, ''); 
  
  return {
    isValid: phoneRegex.test(cleanPhone),
    sanitized,
    error: !phoneRegex.test(cleanPhone) ? 'Please enter a valid Romanian phone number' : null
  };
};

const UserSettings = () => {
  const { user, logout, loading: authLoading, updateUser } = useContext(AuthContext);
  const [form, setForm] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user?.id) {
      
      axios.get(`${process.env.REACT_APP_API_URL}/users/${user.id}`, { withCredentials: true })
        .then(res => {
          const userData = res.data;
          setForm({
            id: userData.id,
            email: userData.email,
            fullName: userData.fullName,
            city: userData.city,
            phone: userData.phone,
            birthdate: userData.birthdate ? new Date(userData.birthdate) : null,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user?.id, authLoading]);

  
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

  const handleCityChange = (value) => {
    
    const isValidCity = cityOptions.some(option => option.value === value);
    if (isValidCity || value === null) {
      setForm({ ...form, city: value });
      setErrors({ ...errors, city: null });
    } else {
      setErrors({ ...errors, city: 'Please select a valid city' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameValidation = validateFullName(form.fullName);
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.error;
    }
    
    const phoneValidation = validatePhone(form.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error;
    }
    
    if (!form.city) {
      newErrors.city = 'City is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = () => {
    if (!validateForm()) {
      setMessage('Please fix the errors below');
      return;
    }

    
    const payload = {
      fullName: sanitizeInput(form.fullName),
      city: form.city,
      phone: form.phone ? sanitizeInput(form.phone) : null,
    };

    console.log("Payload:", payload);
    
    axios.put(
      `${process.env.REACT_APP_API_URL}/users/${user.id}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
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
    if (window.confirm('Delete your account? This action cannot be undone.')) {
      setDeleting(true);
      axios.delete(`${process.env.REACT_APP_API_URL}/users/${user.id}`, {
        withCredentials: true
      })
        .then(() => {
          setMessage('Account deleted successfully. Redirecting...');
          setTimeout(() => {
            logout();
            navigate('/goodbye');
          }, 1200);
        })
        .catch((error) => {
          console.error('Delete error:', error, error.response);
          if (error.response?.status === 401 || error.response?.status === 403) {
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
      <GlassyBackground>
        <Center style={{ height: '100vh' }}>
          <Loader size="xl" />
        </Center>
      </GlassyBackground>
    );
  }

  return (
    <GlassyBackground>
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
        <GlassyCard style={{ width: '100%', maxWidth: 500, margin: '0 auto', paddingTop: 32, paddingBottom: 32 }}>
          <Title
            align="center"
            style={{
              color: BLUE,
              fontWeight: 800,
              marginBottom: 16,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            User Settings
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
            <Select
              label="City"
              placeholder="Select your city"
              data={cityOptions}
              value={form.city || ''}
              onChange={handleCityChange}
              required
              mt="md"
              size="md"
              radius="md"
              error={errors.city}
              searchable={false}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: errors.city ? 'red' : BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${errors.city ? 'red' : BLUE}44` },
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
        </GlassyCard>
      </Container>
    </GlassyBackground>
  );
};

export default UserSettings;