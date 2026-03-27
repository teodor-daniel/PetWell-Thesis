import {
  Box, Burger, Button, Container, Drawer, Group, Stack, Title, Text
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const GREEN = '#7bc71e';
const BLUE = '#2a4365';
const NAV_HEIGHT = 72;

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
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
      to="/home"
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
    { label: 'Pets', to: '/pets' },
    { label: 'Clinics', to: '/clinics' },
    { label: 'My Account', to: '/usersettings' },
    { label: 'Contact', to: '/contact' },
  ];

  
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
        variant="outline"
        size="md"
        radius="xl"
        color="red"
        onClick={() => { logout(); navigate('/'); }}
        style={{ fontWeight: 700, fontFamily: 'Montserrat, Inter, sans-serif', borderColor: GREEN, color: GREEN }}
        sx={{ '&:hover': { background: GREEN + '22', borderColor: '#5ea314', color: '#5ea314' } }}
      >
        Logout
      </Button>
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
        variant="outline"
        size="lg"
        radius="xl"
        color="red"
        onClick={() => { logout(); closeDrawer(); navigate('/'); }}
        style={{ fontWeight: 700, width: 220, borderColor: GREEN, color: GREEN }}
        sx={{ '&:hover': { background: GREEN + '22', borderColor: '#5ea314', color: '#5ea314' } }}
      >
        Logout
      </Button>
    </Stack>
  );

  return (
    <>
      <Box style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100vw',
        zIndex: 200,
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
            justifyContent: 'space-between',
            height: '100%',
            padding: '0.5rem 2rem',
            color: '#2a4365',
            position: 'relative',
          }}
        >
          {Logo}
          {!isMobile && DesktopNav}
          {!isMobile && DesktopRight}
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