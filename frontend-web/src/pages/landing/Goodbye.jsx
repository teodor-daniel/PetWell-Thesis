import { Button, Center, Container, Image, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import sadKitty from '../../assets/sad_kitty.jpg';


const Goodbye = () => {
  const navigate = useNavigate();

  return (
    <Center style={{ height: '100vh' }}>
      <Container size="sm" style={{ textAlign: 'center' }}>
        <Image src={sadKitty} alt="Sad Kitty" width={180} mx="auto" mb="md" />
        <Title order={2}>We'll miss you!</Title>
        <Text mt="md">
          Your account has been deleted. We hope to see you again someday.
        </Text>
        <Button mt="xl" onClick={() => navigate('/landingpage')}>Go to Home</Button>
      </Container>
    </Center>
  );
};

export default Goodbye; 