
import { Box, Button, Card, Center, Container, Grid, Group, Image, Menu, Paper, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconCalendar, IconChartBar, IconChevronDown, IconDeviceMobile, IconHeart, IconMapPin, IconPaw, IconThumbUp } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/style/Footer';
import GlassyBackground from '../../components/style/GlassyBackground';

const GREEN = '#7bc71e';

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <Card
      radius="lg"
      shadow="md"
      p="xl"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(123,199,30,0.10)',
        boxShadow: '0 4px 16px 0 rgba(123,199,30,0.10)',
        textAlign: 'center',
        marginBottom: '2rem',
        transition: 'box-shadow 0.2s',
      }}
    >
      <Center mb="md">
        <Icon size={48} color={GREEN} />
      </Center>
      <Title order={3} style={{ color: GREEN, fontWeight: 700, marginBottom: 8 }}>{title}</Title>
      <Text color="dimmed" size="md">{desc}</Text>
    </Card>
  );
}

function PlanCard({ title, price, features, signupRoute }) {
  return (
    <Card
      radius="lg"
      shadow="md"
      p="xl"
      style={{
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(123,199,30,0.10)',
        boxShadow: '0 4px 16px 0 rgba(123,199,30,0.10)',
        textAlign: 'center',
        marginBottom: '2rem',
        transition: 'box-shadow 0.2s',
      }}
    >
      <Title order={3} style={{ color: GREEN, fontWeight: 700, marginBottom: 8 }}>{title}</Title>
      <Title order={1} style={{ color: GREEN, fontWeight: 800, marginBottom: 16 }}>{price}</Title>
      {features.map((f, i) => (
        <Text key={i} mb={4}>{f}</Text>
      ))}
      <Button
        component={Link}
        to={signupRoute}
        fullWidth
        mt="lg"
        size="md"
        radius="md"
        style={{
          background: GREEN,
          color: '#fff',
          fontWeight: 700,
          boxShadow: '0 2px 8px #7bc71e33',
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
        sx={{ '&:hover': { background: '#5ea314' } }}
      >
        Choose this plan
      </Button>
    </Card>
  );
}

export default function LandingPage() {
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const navigate = useNavigate();

  return (
    <GlassyBackground>
<Container size="lg" py="xl">
        {/* Hero Section */}
        <Paper radius="lg" shadow="xl" p="xl" mb="xl" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(123,199,30,0.10)', boxShadow: '0 8px 32px 0 rgba(123,199,30,0.10)', borderRadius: '1.5rem', textAlign: 'center', marginBottom: '3rem' }}>
          <Group position="center" mb="md">
            <IconPaw size={48} color={GREEN} />
          </Group>
          <Title order={1} style={{ color: GREEN, fontWeight: 800, fontSize: '2.5rem', marginBottom: '1rem' }}>
            PetWell Simplifying Pet Health Management
          </Title>
          <Text size="xl" color="dimmed" mb="xl">
            PetWell simplifies pet health monitoring for owners and clinics: appointments, records, reminders, and vet access in one app.
          </Text>
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Button
                size="xl"
                radius="md"
                rightIcon={<IconChevronDown size={16} />}
                style={{ background: GREEN, color: '#fff', fontWeight: 700, boxShadow: '0 2px 8px #7bc71e33', transition: 'background 0.2s, box-shadow 0.2s' }}
                sx={{ '&:hover': { background: '#5ea314' } }}
              >
                Sign Up
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item component={Link} to="/signup">As Pet Owner</Menu.Item>
              <Menu.Item component={Link} to="/signup/vet">As Vet</Menu.Item>
              <Menu.Item component={Link} to="/signup/clinic-owner">As Clinic Owner</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Paper>

        {/* Features for Clinics Section */}
        <Paper radius="lg" shadow="md" p="xl" mb="xl" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(123,199,30,0.10)', boxShadow: '0 4px 16px 0 rgba(123,199,30,0.10)', borderRadius: '1.5rem', marginBottom: '3rem' }}>
          <Title order={2} align="center" mb="xl" style={{ color: GREEN, fontWeight: 800 }}>For The Clinic</Title>
          <Grid gutter="xl" justify="center">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <FeatureItem icon={IconCalendar} title="Manage appointments" desc="Easily handle client bookings." />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <FeatureItem icon={IconMapPin} title="Clinic locations" desc="Show all clinic branches." />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <FeatureItem icon={IconChartBar} title="Statistics" desc="Track visits and performance." />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Features for Pets Section */}
        <Paper radius="lg" shadow="md" p="xl" mb="xl" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(123,199,30,0.10)', boxShadow: '0 4px 16px 0 rgba(123,199,30,0.10)', borderRadius: '1.5rem', marginBottom: '3rem' }}>
          <Title order={2} align="center" mb="xl" style={{ color: GREEN, fontWeight: 800 }}>For Your Pets</Title>
          <Grid gutter="xl" justify="center">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <FeatureItem icon={IconThumbUp} title="Easy to use" desc="Vaccines, records, visits." />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <FeatureItem icon={IconDeviceMobile} title="Mobile first design" desc="Access anytime, anywhere." />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <FeatureItem icon={IconHeart} title="Monitor health" desc="Follow pet growth & health." />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Image/Info Section */}
        <Paper radius="lg" shadow="md" p="xl" mb="xl" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(123,199,30,0.10)', boxShadow: '0 4px 16px 0 rgba(123,199,30,0.10)', borderRadius: '1.5rem', marginBottom: '3rem' }}>
          <Box style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 24 : 48 }}>
            <Image 
              src="petneed.jpg" 
              alt="Welcome" 
              radius="md" 
              fit="contain" 
              height={isMobile ? 220 : 340} 
              style={{ flex: '0 0 auto', maxWidth: isMobile ? '100%' : 550, width: '100%', minWidth: 0 }} 
            />
            <Box style={{ flex: 1, textAlign: isMobile ? 'center' : 'left', padding: isMobile ? '1.5rem 0 0 0' : '0 0 0 2rem' }}>
              <Title order={3} mb="xs">We make it easy to track your needs</Title>
              <Text size="lg" color="dimmed" mt="md">
                All your pet's appointments, records, and health in one place. Stay organized and never miss a thing!
              </Text>
            </Box>
          </Box>
        </Paper>

        {/* Platforms Section */}
        <Paper
          radius="lg"
          shadow="md"
          p="xl"
          mb="xl"
          style={{
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(123,199,30,0.10)',
            boxShadow: '0 4px 16px 0 rgba(123,199,30,0.10)',
            borderRadius: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isMobile ? 24 : 48,
            }}
          >
                          <Title order={3} mb="xs">Mobile First Design</Title>

            <Image
              src="mobile-desktop.jpg"
              alt="Mobile app preview"
              radius="md"
              fit="contain"
              height={isMobile ? 220 : 340}
              style={{
                flex: '0 0 auto',
                maxWidth: isMobile ? '100%' : 220,
                width: '100%',
                minWidth: 0,
                marginTop: isMobile ? 24 : 0,
              }}
            />
          </Box>
        </Paper>

        {/* Plans Section */}
        <Paper radius="lg" shadow="md" p="xl" mb="xl" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(123,199,30,0.10)', boxShadow: '0 4px 16px 0 rgba(123,199,30,0.10)', borderRadius: '1.5rem', marginBottom: '3rem' }}>
          <Title order={2} align="center" mb="xl" style={{ color: GREEN, fontWeight: 800 }}>Choose your plan</Title>
          <Grid gutter="xl" justify="center">
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <PlanCard 
                title="For Pet Owners" 
                price="$0" 
                features={["Track vaccines", "Vet appointment reminders", "Medical history", "Find nearby vets"]} 
                signupRoute="/signup"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
              <PlanCard 
                title="For Clinics" 
                price="$0" 
                features={["3 Locations", "10 Veterinarians", "Unlimited Customers", "Advanced Analytics"]} 
                signupRoute="/signup/clinic-owner"
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Footer */}
        <Footer />
      </Container>
    </GlassyBackground>
  );
}
