import { Badge, Button, Card, Stack, Text } from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export default function ClinicCard({ clinic, component: Component, to, state }) {
  const navigate = useNavigate();

  
  if (Component && to) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Stack spacing="xs">
          <Text fw={700} size="lg">{clinic.name}</Text>
          <Badge color="green" variant="light">{clinic.city}</Badge>
          <Text size="sm" c="dimmed">{clinic.phone}</Text>
          <Button
            leftSection={<IconMapPin size={16} />}
            variant="outline"
            color="green"
            component={Component}
            to={to}
            state={state}
          >
            Visit clinic
          </Button>
        </Stack>
      </Card>
    );
  }

  
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack spacing="xs">
        <Text fw={700} size="lg">{clinic.name}</Text>
        <Badge color="green" variant="light">{clinic.city}</Badge>
        <Text size="sm" c="dimmed">{clinic.phone}</Text>
        <Button
          leftSection={<IconMapPin size={16} />}
          variant="outline"
          color="green"
          onClick={() => navigate(`/clinics/${clinic.id}`, { state: { clinic } })}
        >
          Visit clinic
        </Button>
      </Stack>
    </Card>
  );
}
