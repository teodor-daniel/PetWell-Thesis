import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Stack,
  Text,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

const VetCard = ({ vet, onEdit, onDelete, showActions }) => {
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack spacing="xs">
        <Group position="apart">
          <Text fw={500} size="lg">{vet.fullName}</Text>
          {showActions && (
            <Group spacing={4}>
              <ActionIcon variant="subtle" color="red" size="sm" onClick={onDelete}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          )}
        </Group>

        <Text size="sm" color="dimmed">{vet.email}</Text>
        <Text size="sm">{vet.phone}</Text>

        {vet.specialities && (
          <Group spacing="xs" mt="xs">
            {vet.specialities.split(',').map((spec, i) => (
              <Badge key={i} size="sm" variant="light">
                {spec.trim()}
              </Badge>
            ))}
          </Group>
        )}
      </Stack>
    </Card>
  );
};

export default VetCard;
