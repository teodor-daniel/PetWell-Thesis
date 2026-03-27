import { Alert, Button, Container, PasswordInput, Select, TextInput, Title } from '@mantine/core';
import axios from 'axios';
import { format } from 'date-fns';
import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link, useNavigate } from 'react-router-dom';
import GlassyBackground from '../components/style/GlassyBackground';
import GlassyCard from '../components/style/GlassyCard';

const GREEN = '#7bc71e';

const ClinicOwnerSignup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [birthdate, setBirthdate] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  const cityOptions = [
    { value: 'Bucuresti', label: ' București' },
    { value: 'Iasi', label: ' Iași' },
    { value: 'Constanta', label: ' Constanța' },
    { value: 'Craiova', label: ' Craiova' },
    { value: 'Brasov', label: ' Brașov' },
    { value: 'Galati', label: ' Galați' },
    { value: 'Ploiesti', label: ' Ploiești' },
    { value: 'Pitesti', label: ' Pitești' },
  ];

  const validateFullName = (name) => /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(name);
  const validateEmail = (email) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email);
  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^(\+40|0040|0)?[27]\d{8}$/;
    return phoneRegex.test(phone);
  };
  const validateCity = (city) => {
    const allowed = ["Bucuresti", "Iasi", "Constanta", "Craiova", "Brasov", "Galati", "Ploiesti", "Pitesti"];
    return allowed.includes(city);
  };
  const validateBirthdate = (birthdate) => {
    if (!birthdate) return false;
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    return birthdate <= thirteenYearsAgo;
  };
  const validatePassword = (password) => password && password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!validateFullName(fullName)) errors.fullName = 'Name must be 2-50 letters.';
    if (!validateEmail(email)) errors.email = 'Please provide a valid email address.';
    if (!validatePhone(phone)) errors.phone = 'Please provide a valid phone number.';
    if (!validateCity(city)) errors.city = 'Please select a valid city.';
    if (!validateBirthdate(birthdate)) errors.birthdate = 'You must be at least 13 years old.';
    if (!validatePassword(password)) errors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formattedBirthdate = format(birthdate, 'dd-MM-yyyy');

    const payload = {
      fullName,
      email: email.toLowerCase(),
      password,
      phone,
      city,
      street,
      role: 'OWNER',
      birthdate: formattedBirthdate,
    };

    setLoading(true);
    setError(null);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/users/create`, payload, { withCredentials: true });
      navigate('/');
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
              color: GREEN,
              fontWeight: 800,
              marginBottom: 16,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Register as Clinic Owner
          </Title>
          {error && (
            <Alert color="red" title="Registration Error" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <TextInput
              label="Full Name"
              placeholder="Your full name"
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
                  borderColor: GREEN,
                  '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
                },
                label: { color: GREEN, fontWeight: 600 },
              }}
            />

            <TextInput
              label="Email"
              placeholder="you@example.com"
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
                  borderColor: GREEN,
                  '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
                },
                label: { color: GREEN, fontWeight: 600 },
              }}
            />

            <TextInput
              label="Phone Number"
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
                title: 'Enter a phone number 07XXXXXXXX ',
                maxLength: 10,
                inputMode: 'numeric',
              }}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: GREEN,
                  '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
                },
                label: { color: GREEN, fontWeight: 600 },
              }}
            />

            <Select
              label="City"
              placeholder="Select your city"
              data={cityOptions}
              value={city}
              onChange={setCity}
              required
              mt="md"
              size="md"
              radius="md"
              error={fieldErrors.city}
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: GREEN,
                  '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
                },
                label: { color: GREEN, fontWeight: 600 },
              }}
            />

            <TextInput
              label="Street"
              placeholder="Street address"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              mt="md"
              size="md"
              radius="md"
              styles={{
                input: {
                  background: 'rgba(255,255,255,0.7)',
                  borderColor: GREEN,
                  '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
                },
                label: { color: GREEN, fontWeight: 600 },
              }}
            />

            <div style={{ marginTop: '1rem' }}>
              <label
                htmlFor="birthdate"
                style={{
                  marginBottom: '0.5rem',
                  display: 'block',
                  fontSize: '0.9rem',
                  color: GREEN,
                  fontWeight: 600,
                }}
              >
                Birthdate
              </label>
              <ReactDatePicker
                id="birthdate"
                selected={birthdate}
                onChange={(date) => setBirthdate(date)}
                dateFormat="dd-MM-yyyy"
                placeholderText="DD-MM-YYYY"
                className="mantine-TextInput-input"
                wrapperClassName="react-datepicker-wrapper"
                required
                style={{
                  width: '100%',
                  borderRadius: 8,
                  border: `1.5px solid ${GREEN}`,
                  padding: '0.7rem',
                  background: 'rgba(255,255,255,0.7)',
                }}
              />
              {fieldErrors.birthdate && (
                <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.birthdate}
                </div>
              )}
            </div>

            <PasswordInput
              label="Password"
              placeholder="Your password"
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
                  borderColor: GREEN,
                  '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
                },
                label: { color: GREEN, fontWeight: 600 },
              }}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Re-enter your password"
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
                  borderColor: GREEN,
                  '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
                },
                label: { color: GREEN, fontWeight: 600 },
              }}
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              mt="xl"
              mb="lg"
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
              Register
            </Button>
          </form>

          <Button
            component={Link}
            to="/login"
            fullWidth
            variant="outline"
            color={GREEN}
            size="md"
            radius="md"
            style={{ fontWeight: 600, borderColor: GREEN, color: GREEN, marginTop: 12 }}
            sx={{ '&:hover': { background: GREEN + '22', borderColor: '#5ea314', color: '#5ea314' } }}
          >
            Go to Login
          </Button>
        </GlassyCard>
      </Container>
    </GlassyBackground>
  );
};

export default ClinicOwnerSignup; 