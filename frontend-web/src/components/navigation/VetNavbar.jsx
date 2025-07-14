import { Box, Burger, Button, Drawer, Group, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconLogout, IconStethoscope } from '@tabler/icons-react';
import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const VetNavbar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleLogout = () => {
    logout();
    navigate('/landing');
  };

  const navItems = [
    { label: 'Dashboard', path: '/vet-dashboard' },
    { label: 'Account Settings', path: '/vet/account-settings' },

  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant="subtle"
          component={Link}
          to={item.path}
          onClick={() => setOpened(false)}
          fullWidth={isMobile}
          size={isMobile ? "lg" : "md"}
          styles={{
            root: {
              fontSize: isMobile ? '1.2rem' : '1rem',
            }
          }}
        >
          {item.label}
        </Button>
      ))}
      <Button
        variant="light"
        color="red"
        onClick={() => {
          handleLogout();
          setOpened(false);
        }}
        fullWidth={isMobile}
        size={isMobile ? "md" : "sm"}
        leftSection={<IconLogout size={16} />}
        styles={{
          root: {
            fontSize: isMobile ? '1rem' : '0.9rem',
            marginTop: isMobile ? '0.5rem' : 0,
          }
        }}
      >
        Logout
      </Button>
    </>
  );

  return (
    <Box component="nav" py="md" px="xl" style={{ borderBottom: '1px solid #eee' }}>
      <Group h="100%" px="md" justify="space-between">
        <Group>
          <Group>
            <IconStethoscope size={isMobile ? 32 : 24} />
            <Text 
              size={isMobile ? "xl" : "xl"} 
              fw={700} 
              component={Link} 
              to="/vet-dashboard" 
              style={{ 
                textDecoration: 'none', 
                color: 'inherit',
                fontSize: isMobile ? '1.5rem' : '1.25rem'
              }}
            >
              PetWell Vet
            </Text>
          </Group>
        </Group>

        {isMobile ? (
          <>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              color={theme.colors.gray[6]}
            />
            <Drawer
              opened={opened}
              onClose={() => setOpened(false)}
              size="100%"
              padding="md"
              zIndex={1000}
            >
              <Stack spacing="xl" mt="xl">
                <NavLinks />
              </Stack>
            </Drawer>
          </>
        ) : (
          <Group ml={50}>
            <NavLinks />
          </Group>
        )}
      </Group>
    </Box>
  );
};

export default VetNavbar; 