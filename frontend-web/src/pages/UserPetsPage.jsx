import { Container } from '@mantine/core';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import PetsSection from '../components/pet/PetsSection';
import { AuthContext } from '../contexts/AuthContext';
import GlassyBackground from '../components/style/GlassyBackground';
import Navbar from '../components/navigation/Navbar';

const UserPetHome = () => {
  const [pets, setPets] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchPets = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/pets/mine`, {
        withCredentials: true,
      });
      setPets(res.data);
    } catch (err) {
      console.error('Error fetching pets:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [user]);

  const handleAddPet = () => {
    fetchPets();
  };

  return (
    <GlassyBackground>
      <Navbar />
      <Container size="xl" py="xl">
        <PetsSection user={user} />
      </Container>
    </GlassyBackground>
  );
};

export default UserPetHome; 