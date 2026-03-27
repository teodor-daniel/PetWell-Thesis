import {
  Alert,
  Button,
  Container,
  PasswordInput,
  Select,
  TextInput,
  Title,
  Text,
} from '@mantine/core';
import axios from 'axios';
import { format } from 'date-fns';
import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link, useNavigate } from 'react-router-dom';
import GlassyBackground from '../components/style/GlassyBackground';
import GlassyCard from '../components/style/GlassyCard';

const GREEN = '#7bc71e';

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

function sanitizeInput(str) {
  
  return str.replace(/<.*?>/g, '').trim();
}

function validateFullName(name) {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/;
  return nameRegex.test(name);
}
function validateEmail(email) {
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
  return emailRegex.test(email);
}
function validatePhone(phone) {
  if (!phone) return true;
  const phoneRegex = /^(\+40|0040|0)?[27]\d{8}$/;
  return phoneRegex.test(phone);
}
function validateCity(city) {
  const allowed = ["Bucuresti","Iasi","Constanta","Craiova","Brasov","Galati","Ploiesti","Pitesti"];
  return allowed.includes(city);
}
function validateBirthdate(birthdate) {
  if (!birthdate) return false;
  const today = new Date();
  const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
  return birthdate <= thirteenYearsAgo;
}
function validatePassword(password) {
  if (!password || password.length < 8) return false;
  return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
}

const SignUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('0732657369');
  const [city, setCity] = useState('');
  const [birthdate, setBirthdate] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    
    const errors = {};
    if (!validateFullName(fullName)) errors.fullName = 'Name must be 2-50 letters, spaces, hyphens, or apostrophes.';
    if (!validateEmail(email)) errors.email = 'Invalid email address.';
    if (!validatePhone(phone)) errors.phone = 'Invalid phone number.';
    if (!validateCity(city)) errors.city = 'Please select a valid city.';
    if (!validateBirthdate(birthdate)) errors.birthdate = 'You must be at least 13 years old.';
    if (!validatePassword(password)) errors.password = 'Password must be at least 8 chars, with upper, lower, digit, special.';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    
    if (birthdate) {
      const today = new Date();
      const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
      if (birthdate > thirteenYearsAgo) {
        setError('You must be at least 13 years old to sign up. Please ask your parent or guardian to create an account for you.');
        return;
      }
    }

    setError('');

    const formattedBirthdate = format(birthdate, 'dd-MM-yyyy');

    const payload = {
      fullName: sanitizeInput(fullName),
      email: sanitizeInput(email.toLowerCase()),
      password,
      phone: sanitizeInput(phone),
      city: sanitizeInput(city),
      role: 'USER',
      birthdate: formattedBirthdate,
    };

    setLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/users/create`,
        payload,
        { withCredentials: true }
      );
      navigate('/');
    } catch (err) {
      
      
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassyBackground>
      <Container
        size={420}
        my={40}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <GlassyCard style={{ width: '100%', maxWidth: 420, margin: '0 auto' }}>
          <Title
            align="center"
            style={{
              color: GREEN,
              fontWeight: 800,
              marginBottom: 16,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Create a New Account
          </Title>
          {error && (
            <Alert color="red" title="Registration Error" mt="md">
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
              {fieldErrors.birthdate && <Text color="red" size="sm">{fieldErrors.birthdate}</Text>}
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
              Sign Up
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

export default SignUp;
