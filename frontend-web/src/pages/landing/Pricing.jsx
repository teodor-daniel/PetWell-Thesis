import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  List,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { Link } from 'react-router-dom';
import GlassyBackground from '../../components/style/GlassyBackground';

const GREEN = '#7bc71e';

const plans = [
  {
    title: 'Free User',
    price: '$0',
    badge: 'For pet owners',
    features: [
      'Add up to 3 pets',
      'Book & manage appointments',
      'View medical records',
      'Browse clinics & vets',
      'Responsive mobile app',
      'Secure login',
    ],
    signup: '/signup',
    accent: true,
  },
  {
    title: 'Clinic Owner',
    price: '$0',
    badge: 'For clinics',
    features: [
      'Create & manage clinics',
      'Add staff & veterinarians',
      'Manage appointments',
      'View patient records',
      'Clinic dashboard',
      'No hidden fees',
    ],
    signup: '/signup/clinic-owner',
    accent: false,
  },
  {
    title: 'Vet',
    price: '$0',
    badge: 'For veterinarians',
    features: [
      'Join clinics',
      'Manage appointments',
      'View assigned patients',
      'Upload medical records',
      'Personal dashboard',
      'No hidden fees',
    ],
    signup: '/signup/vet',
    accent: false,
  },
];

function PlanCard({ title, price, badge, features, signup, accent }) {
  return (
    <Card
      shadow={accent ? 'xl' : 'md'}
      radius="lg"
      p="xl"
      withBorder
      style={{
        background: accent
          ? 'rgba(255,255,255,0.97)'
          : 'rgba(255,255,255,0.90)',
        border: accent
          ? `2.5px solid ${GREEN}`
          : '1.5px solid rgba(123,199,30,0.10)',
        boxShadow: accent
          ? '0 8px 32px 0 rgba(123,199,30,0.13)'
          : '0 4px 16px 0 rgba(123,199,30,0.08)',
        minWidth: 280,
        maxWidth: 350,
        margin: '0 auto',
        position: 'relative',
        zIndex: accent ? 2 : 1,
        transform: accent ? 'scale(1.04)' : 'none',
      }}
    >
      <Stack align="center" gap="xs">
        <Badge
          color={accent ? 'green' : 'gray'}
          size="lg"
          variant={accent ? 'filled' : 'light'}
          style={{
            marginBottom: 8,
            fontWeight: 600,
            fontSize: 15,
            background: accent ? GREEN : undefined,
          }}
        >
          {badge}
        </Badge>
        <Title order={3} style={{ color: GREEN, fontWeight: 800 }}>
          {title}
        </Title>
        <Text size="xl" fw={700} style={{ color: '#222', margin: '8px 0' }}>
          {price}
        </Text>
        <List spacing="xs" size="md" icon={<span style={{ color: GREEN }}>✓</span>}>
          {features.map((f) => (
            <List.Item key={f}>{f}</List.Item>
          ))}
        </List>
        <Button
          component={Link}
          to={signup}
          fullWidth
          size="md"
          radius="md"
          style={{
            background: GREEN,
            color: '#fff',
            fontWeight: 700,
            marginTop: 18,
            boxShadow: '0 2px 8px #7bc71e33',
            transition: 'background 0.2s',
          }}
          sx={{ '&:hover': { background: '#5ea314' } }}
        >
          Sign up
        </Button>
      </Stack>
    </Card>
  );
}

export default function Pricing() {
  const isMobile = useMediaQuery('(max-width: 900px)');

  return (
    <GlassyBackground>
      <Container size="xl" py="xl">
        <Title
          order={2}
          align="center"
          mb="lg"
          style={{
            color: GREEN,
            fontWeight: 900,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: 1,
          }}
        >
          PetWell Pricing
        </Title>
        <Text align="center" size="lg" mb="xl" c="dimmed">
          100% free for this thesis project.
        </Text>
        <Center>
          <Group
            align="stretch"
            spacing={isMobile ? 'xl' : 40}
            style={{
              flexDirection: isMobile ? 'column' : 'row',
              width: '100%',
              maxWidth: 1100,
            }}
          >
            {plans.map((plan) => (
              <PlanCard key={plan.title} {...plan} />
            ))}
          </Group>
        </Center>
      </Container>
    </GlassyBackground>
  );
} 