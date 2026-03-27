import {
  Alert,
  Button,
  Container,
  MultiSelect,
  PasswordInput,
  TextInput,
  Title
} from '@mantine/core';
import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import GlassyBackground from '../components/style/GlassyBackground';
import GlassyCard from '../components/style/GlassyCard';

const GREEN = '#7bc71e';
const BLUE = '#2a4365';

const AddVet = () => {

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialities, setSpecialities] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});


  const { id: clinicId } = useParams();
  const navigate = useNavigate();

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

  
  const validateFullName = (name) => /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(name);
  const validateEmail = (email) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email);
  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^(\+40|0040|0)?[27]\d{8}$/;
    return phoneRegex.test(phone);
  };
  const validateSpecialities = (specs) => specs && specs.length > 0;
  const validatePassword = (password) => password && password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const errors = {};
    if (!validateFullName(fullName)) errors.fullName = 'Name must be 2-50 letters.';
    if (!validateEmail(email)) errors.email = 'Please provide a valid email address.';
    if (!validatePhone(phone)) errors.phone = 'Please provide a valid phone number.';
    if (!validateSpecialities(specialities)) errors.specialities = 'Please select at least one speciality.';
    if (!validatePassword(password)) errors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
    
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const idToLabel = Object.fromEntries(
      specialityOptions.map(o => [o.value, o.label])
    );
    const formattedSpecs = specialities
        .map(s => idToLabel[s] ?? s)
        .join(', ');

    const payload = {
      fullName: fullName.trim(),
      email:    email.toLowerCase().trim(),
      phone:    phone.trim(),
      specialities: formattedSpecs,
      password,
      isActive: false
    };

    setLoading(true);
    setError(null);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/vets/register`,
        payload
      );
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassyBackground>
      <Container
        size={500}
        my={40}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <GlassyCard style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
          <Title
            align="center"
            style={{
              color: BLUE,
              fontWeight: 800,
              marginBottom: 16,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Add a New Vet
          </Title>
          {error && (
            <Alert color="red" title="Error" mb="md">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} autoComplete="off">
            <TextInput
              label="Full Name"
              placeholder="Dr. Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              size="md"
              radius="md"
              mt="md"
              error={fieldErrors.fullName}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${BLUE}44` },
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <TextInput
              label="E-mail"
              placeholder="vet@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              mt="md"
              size="md"
              radius="md"
              error={fieldErrors.email}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${BLUE}44` },
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <TextInput
              label="Phone"
              placeholder="07XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              mt="md"
              size="md"
              radius="md"
              error={fieldErrors.phone}
              inputProps={{
                pattern: '^(\\+40|0)?7\\d{8}$',
                title: 'Enter a Romanian mobile number, e.g. 07XXXXXXXX',
              }}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${BLUE}44` },
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <MultiSelect
              label="Specialities"
              placeholder="Select or type…"
              data={specialityOptions}
              searchable
              creatable
              clearable
              value={specialities}
              onChange={setSpecialities}
              mt="md"
              size="md"
              radius="md"
              error={fieldErrors.specialities}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${BLUE}44` },
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <PasswordInput
              label="Password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              mt="md"
              size="md"
              radius="md"
              error={fieldErrors.password}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${BLUE}44` },
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              mt="md"
              size="md"
              radius="md"
              error={fieldErrors.confirmPassword}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: BLUE,
                  '&:focus': { boxShadow: `0 0 0 2px ${BLUE}44` },
                },
                label: { color: BLUE, fontWeight: 600 },
              }}
            />
            <Button
              type="submit"
              fullWidth
              mt="xl"
              size="md"
              radius="md"
              style={{
                background: GREEN,
                color: '#fff',
                fontWeight: 700,
                boxShadow: '0 2px 8px #7bc71e33',
                transition: 'background 0.2s',
              }}
              sx={{ '&:hover': { background: '#5ea314' } }}
            >
              Save Vet
            </Button>
          </form>

          <Button
            variant="subtle"
            fullWidth
            mt="sm"
            component={Link}
            to="/login"
          >
            Go to Login
          </Button>
        </GlassyCard>
      </Container>
    </GlassyBackground>
  );
};

export default AddVet;
