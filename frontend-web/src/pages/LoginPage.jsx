import { Alert, Button, Checkbox, Container, Paper, PasswordInput, TextInput, Title, Group, rem, Text, Menu } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { IconPaw } from '@tabler/icons-react';
import GlassyBackground from '../components/style/GlassyBackground';
import { useMediaQuery } from '@mantine/hooks';

const BABY_BLUE = '#89CFF0';
const BABY_BLUE_DARK = '#6bb1d6';
const GREEN = '#7bc71e';

function MobileLoginCard({ email, setEmail, password, setPassword, keepLoggedIn, setKeepLoggedIn, handleSubmit, loading, error }) {
  return (
    <Container
      size={360}
      px={0}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 0',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <Paper
        withBorder
        shadow="xl"
        p="lg"
        radius="lg"
        style={{
          width: '100%',
          maxWidth: 360,
          background: 'rgba(255,255,255,0.92)',
          border: '1px solid rgba(123,199,30,0.10)',
          boxShadow: '0 8px 32px 0 rgba(123,199,30,0.10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '0 auto',
        }}
      >
        <Group position="center" mb="md">
          <IconPaw size={40} color={GREEN} />
          <Title order={2} style={{ fontWeight: 800, color: GREEN, letterSpacing: '-1px', fontFamily: 'inherit' }}>PetWell Placeholder</Title>
        </Group>
        <Title align="center" order={4} color={GREEN} mb="xs" style={{ fontWeight: 600 }}>Log in to your account</Title>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            required
            size="md"
            radius="md"
            mt="sm"
            styles={{
              input: {
                background: 'rgba(255,255,255,0.7)',
                borderColor: GREEN,
                '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
              },
              label: { color: GREEN, fontWeight: 600 }
            }}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            size="md"
            radius="md"
            mt="md"
            styles={{
              input: {
                background: 'rgba(255,255,255,0.7)',
                borderColor: GREEN,
                '&:focus': { boxShadow: `0 0 0 2px ${GREEN}44` },
              },
              label: { color: GREEN, fontWeight: 600 }
            }}
          />
          <Checkbox
            label="Keep me logged in"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            mt="md"
            size="md"
            radius="md"
            color={GREEN}
            styles={{ label: { color: GREEN } }}
          />
          {error && (
            <Alert color="red" title="Login Error" mt="md">
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            loading={loading}
            fullWidth
            mt="xl"
            mb="md"
            size="md"
            radius="md"
            style={{
              background: GREEN,
              color: '#fff',
              fontWeight: 700,
              boxShadow: '0 2px 8px #7bc71e33',
            }}
            sx={{
              '&:hover': {
                background: '#5ea314',
              },
            }}
          >
            Login
          </Button>
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <Button
                fullWidth
                variant="outline"
                color={GREEN}
                size="md"
                radius="md"
                style={{ fontWeight: 600, borderColor: GREEN, color: GREEN }}
                sx={{ '&:hover': { background: GREEN + '22', borderColor: '#5ea314', color: '#5ea314' } }}
              >
                Create an account
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item component={Link} to="/signup">As Pet Owner</Menu.Item>
              <Menu.Item component={Link} to="/signup/vet">As Vet</Menu.Item>
              <Menu.Item component={Link} to="/signup/clinic-owner">As Clinic Owner</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </form>
      </Paper>
    </Container>
  );
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const navigate = useNavigate();
  const { user, loading, error, login } = useContext(AuthContext);
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    if (user) {
      if (user.role === 'VET') {
        navigate('/vet-dashboard');
      } else {
        navigate('/home');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login({ email, password, keepLoggedIn });
    if (result.success) {
      if (result.user?.role === 'VET') {
        console.log('Vet login successful:', result.user);
        navigate('/vet-dashboard');
      } else {
        console.log('Login successful:', result.user);
        navigate('/home');
      }
    }
  };


  return (
    <GlassyBackground>
      {isMobile ? (
        <MobileLoginCard
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          keepLoggedIn={keepLoggedIn}
          setKeepLoggedIn={setKeepLoggedIn}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      ) : (
        <Container size={800} px={0} style={{ zIndex: 2, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Paper
            withBorder
            shadow="xl"
            p={0}
            radius="lg"
            style={{
              display: 'flex',
              flexDirection: 'row',
              minWidth: 700,
              maxWidth: 900,
              minHeight: 420,
              overflow: 'hidden',
              backdropFilter: 'blur(16px) saturate(180%)',
              background: 'rgba(255,255,255,0.80)',
              border: '1px solid rgba(123,199,30,0.10)',
              boxShadow: '0 8px 32px 0 rgba(123,199,30,0.10)',
              transition: 'box-shadow 0.2s, transform 0.2s',
              margin: '0 auto',
              animation: 'fadeInUp 0.7s cubic-bezier(.23,1.01,.32,1)'
            }}
            sx={{
              '@media (max-width: 900px)': {
                flexDirection: 'column',
                minWidth: 320,
                maxWidth: '95vw',
                minHeight: 0,
              },
              '@media (max-width: 600px)': {
                flexDirection: 'column',
                minWidth: '90vw',
                maxWidth: '98vw',
                minHeight: 0,
                boxShadow: '0 2px 12px 0 rgba(123,199,30,0.10)',
              },
            }}
          >

            <div style={{ flex: 1, padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.92)' }}>
              <Group position="center" mb="md">
                <IconPaw size={40} color={GREEN} style={{ filter: 'drop-shadow(0 2px 8px #7bc71e33)' }} />
                <Title order={2} style={{ fontWeight: 800, color: '#222', letterSpacing: '-1px', fontFamily: 'inherit' }}>PetWell Placeholder</Title>
              </Group>
              <Title align="center" order={4} color={GREEN} mb="xs" style={{ fontWeight: 600 }}>Log in to your account</Title>
              <form onSubmit={handleSubmit} autoComplete="on">
                <TextInput
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                  required
                  autoFocus
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      transition: 'box-shadow 0.2s',
                      boxShadow: '0 0 0 0px #7bc71e44',
                      '&:focus': {
                        boxShadow: `0 0 0 2px #7bc71e88`,
                      },
                    },
                  }}
                  mt="sm"
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  size="md"
                  radius="md"
                  styles={{
                    input: {
                      transition: 'box-shadow 0.2s',
                      boxShadow: '0 0 0 0px #7bc71e44',
                      '&:focus': {
                        boxShadow: `0 0 0 2px #7bc71e88`,
                      },
                    },
                  }}
                  mt="md"
                />
                <Checkbox
                  label="Keep me logged in"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  mt="md"
                  size="md"
                  radius="md"
                  color={GREEN}
                />
                {error && (
                  <Alert color="red" title="Login Error" mt="md">
                    {error}
                  </Alert>
                )}
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
                  }}
                  sx={{
                    '&:hover': {
                      background: '#5ea314',
                    },
                  }}
                >
                  Login
                </Button>
                <Menu shadow="md" width={200} position="bottom-end">
                  <Menu.Target>
                    <Button
                      fullWidth
                      variant="outline"
                      color={GREEN}
                      size="md"
                      radius="md"
                      style={{ fontWeight: 600, borderColor: GREEN, color: GREEN }}
                      sx={{ '&:hover': { background: GREEN + '22', borderColor: '#5ea314', color: '#5ea314' } }}
                    >
                      Create an account
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item component={Link} to="/signup">As Pet Owner</Menu.Item>
                    <Menu.Item component={Link} to="/signup/vet">As Vet</Menu.Item>
                    <Menu.Item component={Link} to="/signup/clinic-owner">As Clinic Owner</Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </form>
            </div>

            <div style={{
              flex: 1,
              background: 'rgba(123,199,30,0.07)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 2rem',
              minHeight: 420,
              borderLeft: '1px solid #e6f7e6',
              position: 'relative',
            }}>
              <Title order={3} color={GREEN} mb="md" style={{ fontWeight: 700, textAlign: 'center' }}>
                Welcome!
              </Title>
              <Text color="dimmed" align="center" mb="md" style={{ fontSize: 18, maxWidth: 320 }}>
                Manage your pets, appointments, and medical records all in one place. <br />
                <span style={{ color: GREEN, fontWeight: 600 }}>Healthy pets, happy owners.</span>
              </Text>

              <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#e6f7e6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <IconPaw size={60} color={GREEN} />
              </div>
            </div>
          </Paper>
        </Container>
      )}
      <style>{`
        @media (max-width: 600px) {
          .mantine-Container-root {
            padding: 0 !important;
          }
          .mantine-Paper-root {
            flex-direction: column !important;
            min-width: 98vw !important;
            max-width: 100vw !important;
            min-height: 0 !important;
            box-shadow: 0 2px 12px 0 rgba(123,199,30,0.10) !important;
          }
          .mantine-Group-root {
            flex-direction: row !important;
            gap: 0.5rem !important;
          }
          .mantine-Title-root {
            font-size: 1.5rem !important;
          }
          .mantine-TextInput-root, .mantine-PasswordInput-root {
            font-size: 1rem !important;
          }
          .mantine-Button-root {
            font-size: 1rem !important;
            padding: 0.75rem 1rem !important;
          }
        }
      `}</style>
    </GlassyBackground>
  );
};

export default Login;
