import {
  Box, Burger, Button, Container, Drawer, Group, Menu, Stack, Title, Text
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const GREEN = '#7bc71e';
const BLUE = '#2a4365';
const NAV_HEIGHT = 72;

export default function LandingNavbar() {
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const [drawerOpened, setDrawerOpened] = useState(false);
  const closeDrawer = () => setDrawerOpened(false);
  const navigate = useNavigate();

  
  const Logo = (
    <Group
      spacing={4}
      style={{ cursor: 'pointer', minWidth: 120, textDecoration: 'none' }}
      sx={{ '&:hover': { textDecoration: 'none' } }}
      component={Link}
      to="/landing"
    >
      <Text
        fw={900}
        size="xl"
        style={{
          color: GREEN,
          fontFamily: 'Montserrat, Inter, sans-serif',
          letterSpacing: '0.3px',
          fontSize: '1.5rem',
          fontWeight: 900,
        }}
      >
        Petwell
      </Text>
    </Group>
  );

  
  const navLinks = [
    { label: 'Contact', to: '/contact' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Legal', to: '/legal' },
  ];

  
  const SignUpMenu = (
    <Menu shadow="md" width={200} position="bottom-end">
      <Menu.Target>
        <Button
          size="md"
          radius="xl"
          style={{
            background: GREEN,
            color: '#fff',
            fontWeight: 700,
            fontFamily: 'Montserrat, Inter, sans-serif',
            boxShadow: '0 2px 8px #7bc71e33',
            marginLeft: 8,
            transition: 'background 0.2s',
          }}
          sx={{ '&:hover': { background: '#5ea314' } }}
        >
          Sign up for free
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component={Link} to="/signup">As Pet Owner</Menu.Item>
        <Menu.Item component={Link} to="/signup/vet">As Vet</Menu.Item>
        <Menu.Item component={Link} to="/signup/clinic-owner">As Clinic Owner</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  
  const DesktopNav = (
    <Group spacing={100} style={{ flex: 1, justifyContent: 'center' }}>
      {navLinks.map((link) => (
        <Text
          key={link.label}
          component={Link}
          to={link.to}
          size="md"
          style={{
            color: '#fff',
            fontSize: '1.3rem',
            opacity: 0.92,
            fontWeight: 600,
            fontFamily: 'Montserrat, Inter, sans-serif',
            textDecoration: 'none',
            letterSpacing: '0.01em',
            margin: '0rem 2rem'
          }}
        >
          {link.label}
        </Text>
      ))}
    </Group>
  );

  
  const DesktopRight = (
    <Group spacing={12}>
      <Button
        component={Link}
        to="/login"
        size="md"
        radius="xl"
        style={{ background: GREEN, color: '#fff', fontWeight: 700, fontFamily: 'Montserrat, Inter, sans-serif', boxShadow: '0 2px 8px #7bc71e33', transition: 'background 0.2s' }}
        sx={{ '&:hover': { background: '#5ea314' } }}
      >
        Log in
      </Button>
      {SignUpMenu}
    </Group>
  );

  
  const MobileNavLinks = (
    <Stack gap="xl" align="center" py="xl">
      {navLinks.map((link, idx) => (
        <Title
          key={link.to + '-' + idx}
          component={Link}
          to={link.to}
          order={2}
          onClick={closeDrawer}
          style={{
            textDecoration: 'none',
            color: '#2a4365',
            padding: '1rem',
            fontWeight: 700,
            fontFamily: 'Montserrat, Inter, sans-serif',
            width: 220,
            textAlign: 'center'
          }}
        >
          {link.label}
        </Title>
      ))}
      <Button
        component={Link}
        to="/login"
        size="lg"
        radius="xl"
        style={{ background: GREEN, color: '#fff', fontWeight: 700, width: 220, boxShadow: '0 2px 8px #7bc71e33', margin: '1rem 0' }}
        sx={{ '&:hover': { background: '#5ea314' } }}
        onClick={closeDrawer}
      >
        Log in
      </Button>
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <Button
            size="lg"
            radius="xl"
            style={{
              background: GREEN,
              color: '#fff',
              fontWeight: 700,
              fontFamily: 'Montserrat, Inter, sans-serif',
              boxShadow: '0 2px 8px #7bc71e33',
              marginLeft: 8,
              width: 220,
              transition: 'background 0.2s',
            }}
            sx={{ '&:hover': { background: '#5ea314' } }}
          >
            Sign up for free
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item component={Link} to="/signup">As Pet Owner</Menu.Item>
          <Menu.Item component={Link} to="/signup/vet">As Vet</Menu.Item>
          <Menu.Item component={Link} to="/signup/clinic-owner">As Clinic Owner</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Stack>
  );

  return (
    <>
      <Box style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 200,
        width: '100%',
        background: BLUE,
        borderBottom: `2.5px solid ${GREEN}`,
        boxShadow: '0 2px 12px 0 rgba(50,80,100,0.07)',
        minHeight: NAV_HEIGHT,
        overflowX: 'clip',
      }}>
        <Container
          size="xl"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '0.5rem 2rem',
            color: '#2a4365',
            position: 'relative',
          }}
        >

          <div style={{ minWidth: 120, display: 'flex', alignItems: 'center', flex: 1 }}>
            {Logo}
          </div>

          {!isMobile && (
            <div style={{ position: 'absolute', left: '50%', top: 0, height: '100%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {DesktopNav}
            </div>
          )}

          {!isMobile && (
            <div style={{ minWidth: 320, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
              {DesktopRight}
            </div>
          )}

          {isMobile && (
            <Burger opened={drawerOpened} onClick={() => setDrawerOpened(o => !o)} aria-label="Toggle mobile menu" color="#fff" />
          )}
        </Container>
        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          overlayProps={{ backgroundOpacity: 0.55, blur: 2 }}
          styles={{
            content: {
              background: '#f9fdf9',
            },
            header: {
              background: '#f9fdf9',
              color: '#2a4365',
              borderBottom: 'none',
            },
            close: {
              color: '#2a4365',
            }
          }}
        >
          {MobileNavLinks}
        </Drawer>
      </Box>
      <div style={{ height: NAV_HEIGHT }} />
    </>
  );
}