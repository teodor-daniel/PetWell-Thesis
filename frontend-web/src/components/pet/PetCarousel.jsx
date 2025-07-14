import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Image,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
  Button,
  Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight, IconInfoCircle, IconPaw } from '@tabler/icons-react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ImageUploader from '../fileManagement/ImageUploader';
import { useNavigate } from 'react-router-dom';

const MotionImage = motion(Image);
const MotionBox = motion(Box);

const BLUE = '#2a4365';

export default function PetCarousel({ pets: initialPets, onPetChange, addPetButton, onAddPet }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const titleHeight = isMobile ? 1 : 1;

  useEffect(() => {
    (async () => {
      const enriched = await Promise.all(
        (initialPets || []).map(async (p) => {
          try {
            
            const endpoint = p.imageUrl 
              ? `${process.env.REACT_APP_API_URL}/api/pet-image/${encodeURIComponent(p.name)}`
              : `${process.env.REACT_APP_API_URL}/api/picture/${encodeURIComponent(p.name)}`;
            
            const { data } = await axios.get(endpoint, { withCredentials: true });
            if (typeof data === 'string' && data.startsWith('http')) {
              return { ...p, imageUrl: data };
            }
            return { ...p, imageUrl: null };
          } catch (err) {
            
            if (err.response && err.response.status === 500) {
              console.error('Database inconsistency detected for pet image:', err.response.data);
            }
            return { ...p, imageUrl: null };
          }
        })
      );
      setPets(enriched);
      setLoading(false);
    })();
  }, [initialPets]);

  useEffect(() => {
    if (onPetChange && pets.length > 0) {
      onPetChange(pets[current]);
    }
    
  }, [current, pets]);

  const refreshCurrent = async () => {
    const p = pets[current];
    try {
      
      const endpoint = p.imageUrl 
        ? `${process.env.REACT_APP_API_URL}/api/pet-image/${encodeURIComponent(p.name)}`
        : `${process.env.REACT_APP_API_URL}/api/picture/${encodeURIComponent(p.name)}`;
      
      const { data } = await axios.get(endpoint, { withCredentials: true });
      setPets((old) =>
        old.map((pet, i) => (i === current ? { ...pet, imageUrl: data } : pet))
      );
    } catch (err) {
      
      if (err.response && err.response.status === 500) {
        console.error('Database inconsistency detected for pet image:', err.response.data);
      }
    }
  };

  function calculateAge(birthdate) {
    if (!birthdate) return null;
    const now = new Date();
    const dob = new Date(birthdate);
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months };
  }

  const [age, setAge] = useState(() => calculateAge(pets[current]?.birthdate));
  useEffect(() => {
    setAge(calculateAge(pets[current]?.birthdate));
    const interval = setInterval(() => setAge(calculateAge(pets[current]?.birthdate)), 24*60*60*1000);
    return () => clearInterval(interval);
  }, [pets[current]?.birthdate]);

  console.log('isMobile:', isMobile);
  console.log('pets.length:', pets.length);
  console.log('current:', current);
  console.log('pets:', pets);

  if (loading && pets.length === 0) return <Loader />;

  const pet = pets[current];

  if (!pet && !loading) return <Text align="center">No pets yet!</Text>;

  const idx = (offset) => (current + offset + pets.length) % pets.length;
  const goPrev = () => setCurrent(idx(-1));
  const goNext = () => setCurrent(idx(1));
  const src = (pet) => {
    if (pet?.imageUrl) return pet.imageUrl;
    if (pet?.species?.toLowerCase() === 'dog') return '/dog_placeholder.webp';
    if (pet?.species?.toLowerCase() === 'cat') return '/cat_placeholder.webp';
    return '/placeholder.jpg';
  };
  const size = isMobile ? '70vw' : 350;

  return (
    <>
      <Stack align="center" style={{ backgroundColor: 'transparent', opacity: 1 }} gap={isMobile ? 'md' : 'xl'}>
        <Flex align="center" mb="lg" justify="center" gap={isMobile ? 'md' : 'xl'} w="100%">
          {!isMobile && pets.length > 1 && (
            <SidePet src={src(pets[idx(-1)])} onClick={goPrev} dir="left" />
          )}

          <AnimatePresence mode="wait">
            {pet && (
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 0, scale: isMobile ? 1 : 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 0, scale: isMobile ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
                drag={isMobile ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(event, info) => {
                  const threshold = 100;
                  if (info.offset.x > threshold) {
                    goPrev();
                  } else if (info.offset.x < -threshold) {
                    goNext();
                  }
                }}
              >
                <Stack align="center" px="md" py={isMobile ? 'md' : 'lg'}
                       style={{ width: size, height: size, ... (isMobile ? {} : { minWidth: size, minHeight: size }) }}>
                  <div style={{ minHeight: titleHeight }}>
                    <Title mb="xl" order={isMobile ? 5 : 4} ta="center">{pet.name}</Title>
                  </div>
                    <Image
                      src={src(pet)}
                      alt={pet.name}
                      w={size}
                      h={size}
                      mt="xs"
                      radius="50%"
                      fit="cover"
                      width={!isMobile ? size : undefined}
                      height={!isMobile ? size : undefined}
                      style={{
                        border: '2px solid #000',
                        boxShadow: '0 4px 12px rgba(0,0,0,.1)',
                        cursor: 'pointer',
                      }}
                      onClick={() => setOpen(true)}
                    />
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobile && pets.length > 1 && (
            <SidePet src={src(pets[idx(1)])} onClick={goNext} dir="right" />
          )}
        </Flex>

        {isMobile && pets.length > 1 && (
          <Group
            spacing="xs"
            mt="md"
            position="center"
            style={{
              marginBottom: 8,
            }}
          >
            {pets.map((_, i) => (
              <motion.div
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: i === current ? BLUE : '#868E96',
                  cursor: 'pointer',
                  display: 'inline-block',
                  margin: '0 3px',
                  opacity: 1,
                  visibility: 'visible',
                  boxSizing: 'border-box',
                }}
                animate={{ scale: i === current ? 1.5 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
              </motion.div>
            ))}
          </Group>
        )}

        <Group position="center" mt={isMobile ? 'sm' : 'md'} spacing={isMobile ? 'sm' : 'md'}>
          <Button
            variant="outline"
            onClick={() => navigate(`/pet/${pet.id}`)}
            size={isMobile ? 'sm' : 'md'}
            leftSection={<IconInfoCircle size={18} />}
            style={{ background: BLUE, color: '#fff' }}
          >
            View Details
          </Button>
          <Button
            leftSection={<IconPaw size={18} />}
            onClick={onAddPet}
            size={isMobile ? 'sm' : 'md'}
            style={{ background: '#7bc71e', color: '#fff' }}
          >
            Add Pet
          </Button>
        </Group>
      </Stack>

      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title={`Change avatar for ${pet.name}`}
        radius="lg"
        centered
      >
        <ImageUploader
          petName={pet.name}
          onSuccess={() => {
            refreshCurrent();
            setOpen(false);
          }}
        />
      </Modal>
    </>
  );
}

function SidePet({ src, onClick, dir }) {
  const Icon = dir === 'left' ? IconChevronLeft : IconChevronRight;
  const sideSize = 240;
  return (
    <Stack align="center" gap="xs">
      <Box style={{transform: 'scale(0.8)' }}>
        <MotionImage
          initial={{ opacity: 0, x: dir === 'left' ? -50 : 50 }}
          animate={{ opacity: 0.7, x: 0 }}
    
          transition={{ duration: 0.3 }}
          src={src}
          alt="side pet"
          w={sideSize}
          h={sideSize}
          radius="50%"
          fit="cover"
          style={{ border: '1px solid #ccc' }}
        />
      </Box>
      <ActionIcon variant="filled" radius="xl" size="xl" onClick={onClick} style={{ background: BLUE }}>
        <Icon size={30} />
      </ActionIcon>
    </Stack>
  );
}