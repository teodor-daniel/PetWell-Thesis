import {
  Anchor,
  Box,
  Center,
  Container,
  Divider,
  Group,
  Text,
  Title,
  Paper,
} from '@mantine/core';
import { IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';

const GREEN = '#7bc71e';

export default function Footer() {
  return (
    <Paper
      radius="lg"
      p="xl"
      mt="xl"
      style={{
        background: 'transparent',
        maxWidth: 700,
        margin: '2rem auto',
        borderRadius: '1.5rem',
        textAlign: 'center',
      }}
    >
      <Group position="center" spacing="sm" mb="xl" style={{ justifyContent: 'center', width: '100%' }}>
        <Anchor href="#" target="_blank">
          <IconBrandFacebook size={40} style={{ borderRadius: '30%', color: '#2a4365', padding: 5, background: 'rgba(42,67,101,0.08)' }} />
        </Anchor>
        <Anchor href="#" target="_blank">
          <IconBrandInstagram size={40} style={{ borderRadius: '30%', color: '#2a4365', padding: 5, background: 'rgba(42,67,101,0.08)' }} />
        </Anchor>
      </Group>

      <Group
        position="center"
        spacing={16}
        my="md"
        style={{ flexWrap: 'wrap', justifyContent: 'center', rowGap: 8 }}
      >
        <Anchor href="#" size="md" style={{ color: GREEN, fontWeight: 600 }}>About</Anchor>
        <Divider orientation="vertical" />
        <Anchor href="#" size="md" style={{ color: GREEN, fontWeight: 600 }}>Contact</Anchor>
      </Group>


      <Center mt="sm">
        <Text size="sd" color="dimmed">
          © 2025 PetWell. All rights reserved.
        </Text>
      </Center>
    </Paper>
  );
}
