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
import { notifications } from '@mantine/notifications';
import { IconBrandGithub, IconMail } from '@tabler/icons-react';
import axios from 'axios';
import { useState } from 'react';
import GlassyBackground from '../../components/style/GlassyBackground';
import GlassyCard from '../../components/style/GlassyCard';

const GREEN = '#7bc71e';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: { name: '', email: '', message: '' },
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
      message: (v) =>
        !v || v.trim().length < 10
          ? 'Tell me a bit more'
          : /[<>]/.test(v)
          ? 'Invalid characters in message.'
          : null,
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/contact/send`,
        {
          name: values.name,
          email: values.email,
          message: values.message
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setSubmitted(true);
        notifications.show({
          title: 'Success!',
          message: 'Your message has been sent successfully!',
          color: 'green',
        });
        form.reset();
        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending contact form:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send message. Please try again.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const formSection = (
    <GlassyCard>
      <Title order={3} mb="md" style={{ color: GREEN, fontWeight: 700 }}>
        Drop me a message
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <TextInput
            label="Name"
            placeholder="Your name"
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
            label="E-mail"
            placeholder="your.email@example.com"
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

          <Textarea
            label="Message"
            placeholder="How can I help you?"
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
            loading={loading}
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
              Message sent! I'll get back to you soon.
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
          Get in touch
        </Title>

        <Text size="sm" c="dimmed">
          This PetWell instance is a <strong>non-commercial university thesis project</strong>.
          No personal data is monetised. You can request all data we hold about you or have it
          deleted at any time via the e-mail below.
        </Text>

        <Divider my="sm" />

        <Group gap="xs">
          <IconMail size={18} color={GREEN} />
          <Anchor href="mailto:teobalan79@yahoo.com" target="_blank" underline="hover" style={{ color: GREEN }}>
            teobalan79@yahoo.com
          </Anchor>
        </Group>

        <Group gap="xs">
          <IconBrandGithub size={18} color={GREEN} />
          <Anchor href="https://github.com/teodor-daniel" target="_blank" underline="hover" style={{ color: GREEN }}>
            github.com/teodor-daniel
          </Anchor>
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
          Contact the Developer
        </Title>
        <Grid gutter="xl" align="center" justify="center">
          <Grid.Col span={{ base: 12, md: 7 }} style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>{formSection}</div>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }} style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: '', justifyContent: 'stretch' }}>{detailsSection}</div>
          </Grid.Col>
        </Grid>
      </Container>
    </GlassyBackground>
  );
}
