import {
  Box,
  Button,
  Grid,
  NumberInput,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
  rem,
  Switch,
} from '@mantine/core';
import {
  IconCalendar,
  IconChevronDown,
  IconPaw,
  IconScale,
} from '@tabler/icons-react';
import axios from 'axios';
import { useContext, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const GREEN = '#7bc71e';

export default function AddPetForm({ onClose }) {
  const { user } = useContext(AuthContext);

  const [name,      setName]    = useState('');
  const [species,   setSpecies] = useState('');
  const [breed,     setBreed]   = useState('');
  const [birthdate, setBirthdate] = useState(null);
  const [weight,    setWeight]  = useState(0);
  const [neutered, setNeutered] = useState(false);
  const [build, setBuild] = useState('SMALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const breeds = {
    Dog: [
      'Labrador Retriever',
      'German Shepherd',
      'Golden Retriever',
      'French Bulldog',
      'Bulldog',
      'Poodle',
      'Beagle',
      'Rottweiler',
      'European'
    ],
    Cat: [
      'Persian',
      'Maine Coon',
      'Siamese',
      'British Shorthair',
      'Ragdoll',
      'Abyssinian',
      'Sphynx',
      'Bengal',
      'European'
    ],
  };

  const validateName = (name) => /^[a-zA-ZÀ-ÿ\s'-]{2,30}$/.test(name);
  const validateSpecies = (species) => species === 'Dog' || species === 'Cat';
  const validateBreed = (breed) => !!breed;
  const validateBirthdate = (date) => date && date <= new Date();
  const validateWeight = (w) => w >= 0;
  const validateBuild = (b) => ['SMALL','MEDIUM','LARGE'].includes(b);

  const savePet = async () => {
    if (isSubmitting) return;
    
    const errors = {};
    if (!validateName(name)) errors.name = 'Name must be 2-30 letters.';
    if (!validateSpecies(species)) errors.species = 'Species is required.';
    if (!validateBreed(breed)) errors.breed = 'Breed is required.';
    if (!validateBirthdate(birthdate)) errors.birthdate = 'Birthdate required and cannot be in the future.';
    if (!validateWeight(weight)) errors.weight = 'Weight must be 0 or more.';
    if (!validateBuild(build)) errors.build = 'Build is required.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) { setIsSubmitting(false); return; }
    setIsSubmitting(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/pets`,
        { name, species, breed, birthdate: birthdate ? format(birthdate, 'yyyy-MM-dd') : null, weight, neutered, build },
        { withCredentials: true },
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert('Could not add pet – please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      radius="lg"
      withBorder
      p="lg"
      style={{ 
        background: 'transparent',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      <Stack gap="md">
        <Title order={4} fw={600} style={{ color: GREEN, textAlign: 'center' }}>
          Add New Pet
        </Title>

        <TextInput
          variant="filled"
          radius="md"
          size="md"
          label={<span style={{ fontWeight: 600, color: GREEN }}>Pet Name</span>}
          placeholder="e.g. Bella"
          leftSection={<IconPaw size={18} color={GREEN} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
          error={fieldErrors.name}
          styles={{
            input: {
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(123, 199, 30, 0.2)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: GREEN,
                backgroundColor: 'rgba(255,255,255,0.95)',
                transform: 'scale(1.02)'
              }
            }
          }}
        />

        <Select
          variant="filled"
          radius="md"
          size="md"
          label={<span style={{ fontWeight: 600, color: GREEN }}>Species</span>}
          placeholder="Select species"
          leftSection={<IconChevronDown size={16} color={GREEN} />}
          value={species}
          onChange={(val) => { setSpecies(val); setBreed(''); }}
          data={[
            { value: 'Dog', label: 'Dog' },
            { value: 'Cat', label: 'Cat' },
          ]}
          required
          disabled={isSubmitting}
          error={fieldErrors.species}
          styles={{
            input: {
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(123, 199, 30, 0.2)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: GREEN,
                backgroundColor: 'rgba(255,255,255,0.95)',
                transform: 'scale(1.02)'
              }
            }
          }}
        />

        <Select
          variant="filled"
          radius="md"
          size="md"
          label={<span style={{ fontWeight: 600, color: GREEN }}>Breed</span>}
          placeholder="Select breed"
          leftSection={<IconChevronDown size={16} color={GREEN} />}
          value={breed}
          onChange={setBreed}
          data={
            species ? breeds[species].map((b) => ({ value: b, label: b })) : []
          }
          disabled={!species || isSubmitting}
          required
          error={fieldErrors.breed}
          styles={{
            input: {
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(123, 199, 30, 0.2)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: GREEN,
                backgroundColor: 'rgba(255,255,255,0.95)',
                transform: 'scale(1.02)'
              }
            }
          }}
        />

        <div>
          <label style={{ fontWeight: 600, color: GREEN, marginBottom: 4, display: 'block' }}>Birthdate</label>
          <ReactDatePicker
            selected={birthdate}
            onChange={setBirthdate}
            dateFormat="dd-MM-yyyy"
            placeholderText="Select birthdate"
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            className="mantine-TextInput-input"
            required
            style={{ 
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(123, 199, 30, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              transition: 'all 0.2s ease',
              fontSize: '14px'
            }}
            disabled={isSubmitting}
            error={fieldErrors.birthdate}
          />
        </div>

        {fieldErrors.birthdate && <span style={{color:'red',fontSize:12}}>{fieldErrors.birthdate}</span>}

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <NumberInput
              variant="filled"
              radius="md"
              size="md"
              label={<span style={{ fontWeight: 600, color: GREEN }}>Weight (kg)</span>}
              placeholder="0"
              leftSection={<IconScale size={16} color={GREEN} />}
              min={0}
              precision={2}
              value={weight}
              onChange={setWeight}
              disabled={isSubmitting}
              error={fieldErrors.weight}
              styles={{
                input: {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(123, 199, 30, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:focus': {
                    borderColor: GREEN,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    transform: 'scale(1.02)'
                  }
                }
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Select
              variant="filled"
              radius="md"
              size="md"
              label={<span style={{ fontWeight: 600, color: GREEN }}>Build</span>}
              placeholder="Select build"
              value={build}
              onChange={setBuild}
              data={[
                { value: 'SMALL', label: 'Small' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'LARGE', label: 'Large' },
              ]}
              required
              disabled={isSubmitting}
              error={fieldErrors.build}
              styles={{
                input: {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(123, 199, 30, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:focus': {
                    borderColor: GREEN,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    transform: 'scale(1.02)'
                  }
                }
              }}
            />
          </Grid.Col>
        </Grid>

        <Switch
          label={<span style={{ fontWeight: 600, color: GREEN }}>Neutered/Spayed?</span>}
          checked={neutered}
          onChange={(e) => setNeutered(e.currentTarget.checked)}
          mt="md"
          disabled={isSubmitting}
          styles={{
            track: {
              backgroundColor: 'rgba(123, 199, 30, 0.3)',
              borderColor: 'rgba(123, 199, 30, 0.5)',
            },
            thumb: {
              backgroundColor: neutered ? GREEN : '#adb5bd',
            }
          }}
        />
      </Stack>

      <Box
        pos="sticky"
        bottom={0}
        mt="lg"
        sx={(theme) => ({
          background: 'transparent',
          paddingTop: rem(12),
        })}
      >
        <Button
          fullWidth
          size="md"
          radius="xl"
          onClick={savePet}
          loading={isSubmitting}
          disabled={isSubmitting}
          color="green"
          style={{
            fontWeight: 700,
            boxShadow: "0 2px 8px rgba(123, 199, 30, 0.15)",
            paddingLeft: 24,
            paddingRight: 24,
            transition: "box-shadow 0.2s, background 0.2s",
            backgroundColor: GREEN,
            '&:hover': {
              backgroundColor: '#6ab017'
            }
          }}
        >
          {isSubmitting ? 'Saving Pet...' : 'Save Pet'}
        </Button>
      </Box>
    </Paper>
  );
}
