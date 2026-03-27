import { Container, Paper, Stack, Text, Title } from '@mantine/core';
import GlassyBackground from '../../components/style/GlassyBackground';

const GREEN = '#7bc71e';

export default function Legal() {
  return (
    <GlassyBackground>
      <Container size="sm" py="xl">
        <Paper
          radius="lg"
          shadow="md"
          p="xl"
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1.5px solid rgba(123,199,30,0.10)',
            boxShadow: '0 4px 16px 0 rgba(123,199,30,0.10)',
            borderRadius: '1.5rem',
            margin: '5 auto',
            maxWidth: 600,
          }}
        >
          <Stack gap="md">
            <Title
              order={2}
              align="center"
              style={{
                color: GREEN,
                fontWeight: 800,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: 1,
              }}
            >
              Legal Notice
            </Title>
            <Text size="lg" align="center" c="dimmed">
              This PetWell instance is a <strong>university thesis project</strong> and is <strong>not intended for commercial use</strong>.
            </Text>
            <Text>
              <strong>Do not use important or real email addresses, passwords, or sensitive personal data.</strong> While we I do not monetize or intentionally share your data, this platform is for demonstration and research purposes only and does not guarantee full data security as it is expensive.
            </Text>
            <Text>
              By using this site, you acknowledge that your data may not be fully protected and you should not use it for any real veterinary or personal needs.
            </Text>
            <Text>
                If you wish to have your data removed, or have any privacy concerns, please contact me at <a href="mailto:teobalan79@yahoo.com" style={{ color: GREEN }}>teobalan79@yahoo.com</a>.
            </Text>
            <Text size="xs" c="dimmed" align="center" mt="lg">
              © {new Date().getFullYear()} PetWell · Student research only · No commercial use
            </Text>
          </Stack>
        </Paper>
      </Container>
    </GlassyBackground>
  );
} 