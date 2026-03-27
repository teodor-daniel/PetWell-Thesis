import {
  Alert,
  Anchor,
  Button,
  Container,
  Divider,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBuilding, IconMail, IconPhone } from '@tabler/icons-react';
import { useState } from 'react';
import GlassyBackground from '../components/style/GlassyBackground';
import GlassyCard from '../components/style/GlassyCard';

const GREEN = '#7bc71e';

export default function OwnerContact() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    initialValues: { 
      name: '', 
      email: '', 
      clinic: '',
      phone: '',
      message: '' 
    },
    validate: {
      name: (v) =>
        !v || v.trim().length < 2
          ? 'Name too short'
          : /[<>]/.test(v)
          ? 'Invalid characters in name.'
          : null,
      email: (v) =>
        !v
          ? 'Email is required'
          : /^\S+@\S+$/.test(v)
          ? null
          : 'Invalid email',
      clinic: (v) =>
        !v || v.trim().length < 2
          ? 'Clinic name is required'
          : null,
      phone: (v) =>
        !v
          ? 'Phone number is required'
          : /^(\+40|0)?7\d{8}$/.test(v)
          ? null
          : 'Invalid Romanian phone number',
      message: (v) =>
        !v || v.trim().length < 10
          ? 'Tell me a bit more'
          : /[<>]/.test(v)
          ? 'Invalid characters in message.'
          : null,
    },
  });

  const handleSubmit = (values) => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      form.reset();
    }, 3000);
  };

  const formSection = (
    <GlassyCard>
      <Title order={3} mb="md" style={{ color: GREEN, fontWeight: 700 }}>
        Contact PetWell Support
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Full Name"
            placeholder="Your Name"
            radius="md"
            size="md"
            withAsterisk
            {...form.getInputProps('name')}
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
            label="Clinic Name"
            placeholder="Your Veterinary Clinic"
            radius="md"
            size="md"
            withAsterisk
            {...form.getInputProps('clinic')}
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
            placeholder="owner@clinic.com"
            radius="md"
            size="md"
            withAsterisk
            {...form.getInputProps('email')}
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
            radius="md"
            size="md"
            withAsterisk
            {...form.getInputProps('phone')}
            styles={{
              input: {
                background: 'rgba(255,255,255,0.7)',
                borderColor: GREEN,
                '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
              },
              label: { color: GREEN, fontWeight: 600 },
            }}
          />

          <Textarea
            label="Message"
            placeholder="How can we help you with PetWell?"
            minRows={4}
            radius="md"
            size="md"
            withAsterisk
            {...form.getInputProps('message')}
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
            radius="xl"
            size="md"
            mt="sm"
            loading={form.isSubmitting}
            style={{
              background: GREEN,
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 2px 8px #7bc71e33',
              transition: 'background 0.2s',
            }}
            sx={{ '&:hover': { background: '#5ea314' } }}
          >
            {submitted ? 'Sent 🎉' : 'Send Message'}
          </Button>
          {submitted && (
            <Alert color="green" mt="md">
              Message sent! We'll get back to you within 24 hours.
            </Alert>
          )}
        </Stack>
      </form>
    </GlassyCard>
  );

  const detailsSection = (
    <GlassyCard>
      <Stack gap="sm" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
        <Title order={3} style={{ color: GREEN, fontWeight: 700 }}>
          Clinic Owner Support
        </Title>

        <Text size="sm" c="dimmed">
          PetWell helps clinic owners manage their veterinary practices efficiently. 
          Contact us for setup assistance, feature requests, or business inquiries.
        </Text>

        <Divider my="sm" />

        <Group gap="xs">
          <IconMail size={18} color={GREEN} />
          <Anchor href="mailto:teobalan79@yahoo.com" target="_blank" underline="hover" style={{ color: GREEN }}>
            teobalan79@yahoo.com
          </Anchor>
        </Group>

        <Group gap="xs">
          <IconPhone size={18} color={GREEN} />
          <Text size="sm" style={{ color: GREEN }}>
            +40 732 657 369
          </Text>
        </Group>

        <Group gap="xs">
          <IconBuilding size={18} color={GREEN} />
          <Text size="sm" style={{ color: GREEN }}>
            University Thesis Project
          </Text>
        </Group>

        <Divider my="sm" />

        <Text size="xs" c="dimmed">
          © {new Date().getFullYear()} PetWell · Student research only · No commercial use
        </Text>
      </Stack>
    </GlassyCard>
  );

  return (
    <GlassyBackground>
      <Container size="lg" py="xl">
        <Title
          order={2}
          mb="lg"
          ta="center"
          style={{
            color: GREEN,
            fontWeight: 800,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: 1,
          }}
        >
          Clinic Owner Support Contact
        </Title>
        <Grid gutter="xl" align="center" justify="center">
          <Grid.Col span={{ base: 12, md: 7 }} style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>{formSection}</div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }} style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>{detailsSection}</div>
          </Grid.Col>
        </Grid>
      </Container>
    </GlassyBackground>
  );
} 