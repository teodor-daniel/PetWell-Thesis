import { Button, Container, Group, Modal, Select, Text, TextInput, Title } from '@mantine/core';
import axios from 'axios';
import { format } from 'date-fns';
import { useContext, useEffect, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import GlassyCard from '../components/style/GlassyCard';
import { AuthContext } from '../contexts/AuthContext';

const GREEN = '#7bc71e';

const OwnerSettingsPage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    id: '',
    email: '',
    fullName: '',
    city: '',
    phone: '',
    street: '',
    birthdate: null,
  });

  const cityOptions = [
    { value: 'Bucuresti', label: 'București' },
    { value: 'Iasi', label: 'Iași' },
    { value: 'Constanta', label: 'Constanța' },
    { value: 'Craiova', label: 'Craiova' },
    { value: 'Brasov', label: 'Brașov' },
    { value: 'Galati', label: 'Galați' },
    { value: 'Ploiesti', label: 'Ploiești' },
    { value: 'Pitesti', label: 'Pitești' },
  ];

  // Validation functions
  const validateFullName = (name) => /^[a-zA-ZÀ-ÿ\s'-]{2,50}$/.test(name);
  const validateEmail = (email) => /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email);
  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^(\+40|0040|0)?[27]\d{8}$/;
    return phoneRegex.test(phone);
  };
  const validateCity = (city) => {
    const allowed = ["Bucuresti","Iasi","Constanta","Craiova","Brasov","Galati","Ploiesti","Pitesti"];
    return allowed.includes(city);
  };
  const validateBirthdate = (birthdate) => {
    if (!birthdate) return false;
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    return birthdate <= thirteenYearsAgo;
  };

  useEffect(() => {
    if (!authLoading && user?.id) {
      // Fetch latest user data from backend
      axios.get(`${process.env.REACT_APP_API_URL}/users/${user.id}`, { withCredentials: true })
        .then(res => {
          const userData = res.data;
          setForm({
            id: userData.id,
            email: userData.email,
            fullName: userData.fullName,
            city: userData.city,
            phone: userData.phone,
            street: userData.street || '',
            birthdate: userData.birthdate ? new Date(userData.birthdate) : null,
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          setLoading(false);
        });
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (user) {
      setAuthLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    // Validate fields
    const errors = {};
    if (!validateFullName(form.fullName)) errors.fullName = 'Name must be 2-50 letters.';
    if (!validateEmail(form.email)) errors.email = 'Please provide a valid email address.';
    if (!validatePhone(form.phone)) errors.phone = 'Please provide a valid phone number.';
    if (!validateCity(form.city)) errors.city = 'Please select a valid city.';
    if (!validateBirthdate(form.birthdate)) errors.birthdate = 'You must be at least 13 years old.';
    
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        city: form.city,
        street: form.street,
        birthdate: form.birthdate ? format(form.birthdate, 'yyyy-MM-dd') : null,
      };

      await axios.put(
        `${process.env.REACT_APP_API_URL}/users/${form.id}`,
        payload,
        { withCredentials: true }
      );
      
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/users/${form.id}`,
        { withCredentials: true }
      );
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.response?.status === 409) {
        alert('Cannot delete account: You have active clinics. Please delete all clinics first.');
      } else {
        alert('Failed to delete account. Please try again.');
      }
    }
    setDeleteModalOpen(false);
  };

  if (loading || authLoading) {
    return (
      <Container size="md" my={40}>
        <GlassyCard>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading...
          </div>
        </GlassyCard>
      </Container>
    );
  }

  return (
    <Container size="md" my={40}>
      <GlassyCard>
        <Title
          align="center"
          style={{
            color: GREEN,
            fontWeight: 800,
            marginBottom: 32,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Account Settings
        </Title>

        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <TextInput
            label="Full Name"
            placeholder="Your full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
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
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            mt="md"
            size="md"
            radius="md"
            error={fieldErrors.phone}
            inputProps={{
              pattern: '^(\\+40|0)?7\\d{8}$',
              title: 'Enter a phone number 07XXXXXXXX',
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
            value={form.city}
            onChange={(value) => setForm({ ...form, city: value })}
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
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
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
              selected={form.birthdate}
              onChange={(date) => setForm({ ...form, birthdate: date })}
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

          <Group mt="xl" justify="space-between">
            <Button
              onClick={handleSave}
              loading={saving}
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
              Save Changes
            </Button>

            <Button
              color="red"
              variant="outline"
              onClick={() => setDeleteModalOpen(true)}
              size="md"
              radius="md"
              style={{
                fontWeight: 600,
                borderColor: '#fa5252',
                color: '#fa5252',
                transition: "all 0.2s ease",
              }}
              sx={{ '&:hover': { backgroundColor: '#fa5252', color: 'white' } }}
            >
              Delete Account
            </Button>
          </Group>
        </div>
      </GlassyCard>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account"
        centered
        size="md"
      >
        <Text mb="lg">
          Are you sure you want to delete your account? This action cannot be undone.
          You can only delete your account if you have no active clinics.
        </Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default OwnerSettingsPage; 