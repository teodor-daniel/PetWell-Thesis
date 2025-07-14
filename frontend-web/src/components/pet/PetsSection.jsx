import {
  ActionIcon,
  Button,
  Card,
  Center,
  Group,
  Image,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  Box,
  Badge,
  Paper,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconEdit, IconPhoto, IconTrash, IconUpload, IconCalendar, IconPaw, IconPlus, IconFileDescription } from '@tabler/icons-react';
import axios from 'axios';
import { useCallback, useContext, useEffect, useState, useRef, useLayoutEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import ImageUploader from '../fileManagement/ImageUploader';
import EditPetForm from '../forms/EditPetForm';
import AddPetForm from '../forms/AddPetForm';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionGroup = motion(Group);
const MotionStack = motion(Stack);
const MotionActionIcon = motion(ActionIcon);
const MotionImage = motion(Image);

function getPetImageSrc(pet) {
  if (pet?.imageUrl) return pet.imageUrl;
  if (pet?.species?.toLowerCase() === 'dog') return '/dog_placeholder.webp';
  if (pet?.species?.toLowerCase() === 'cat') return '/cat_placeholder.webp';
  return '/placeholder.jpg';
}

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


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6
    }
  },
  hover: {
    y: -4,
    scale: 1.01,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

const imageVariants = {
  hover: {
    scale: 1.03,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const actionIconVariants = {
  hover: {
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  },
  tap: {
    scale: 0.9,
    rotate: -5,
    transition: { duration: 0.1 }
  }
};

const addCardVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    rotateY: -90
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    rotateY: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8
    }
  },
  hover: {
    scale: 1.02,
    rotateY: 0,
    boxShadow: "0 8px 15px rgba(0,0,0,0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -50,
    transition: {
      duration: 0.2
    }
  }
};

const loaderVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

export default function PetsSection() {
  const { user } = useContext(AuthContext);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [imagePet, setImagePet] = useState(null);
  const [recordPet, setRecordPet] = useState(null);
  const [recordFile, setRecordFile] = useState(null);
  const [recordUploading, setRecordUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [current, setCurrent] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [panelsHeight, setPanelsHeight] = useState(400);

  const uploadPanelRef = useRef(null);
  const viewPanelRef = useRef(null);

  useLayoutEffect(() => {
    if (recordPet) {
      const uploadHeight = uploadPanelRef.current?.scrollHeight || 0;
      const viewHeight = viewPanelRef.current?.scrollHeight || 0;
      const newHeight = Math.max(400, uploadHeight, viewHeight);
      if (newHeight !== panelsHeight) {
        setPanelsHeight(newHeight);
      }
    } else if (panelsHeight !== 400) {
      setPanelsHeight(400);
    }
  }, [recordPet, medicalRecords, loadingRecords, panelsHeight, activeTab]);

  const isMobile = useMediaQuery('(max-width: 768px)');

  const loadPets = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/pets/mine`,
        { withCredentials: true,  },
      );

      const enriched = await Promise.all(
        data.map(async p => {
          try {
            
            const endpoint = p.imageUrl 
              ? `${process.env.REACT_APP_API_URL}/api/pet-image/${encodeURIComponent(p.name)}`
              : `${process.env.REACT_APP_API_URL}/api/picture/${encodeURIComponent(p.name)}`;
            
            const { data: url } = await axios.get(endpoint, { withCredentials: true });
            if (typeof url === 'string' && url.startsWith('http')) {
              return { ...p, imageUrl: url };
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
    } catch (err) {
      console.error('Error fetching pets:', err);
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => { loadPets(); }, [loadPets]);


  const openEdit = pet => { setSelectedPet(pet); setEditModalOpen(true); };
  const closeEdit = () => { setSelectedPet(null); setEditModalOpen(false); };
  const openImage = pet => setImagePet(pet);
  const closeImage = () => setImagePet(null);
  const openRecord = pet => { setRecordPet(pet); setRecordFile(null); };
  const closeRecord = () => { setRecordPet(null); setRecordFile(null); };
  const openAddModal = () => setAddModalOpen(true);
  const closeAddModal = () => { setAddModalOpen(false); loadPets(); };

  const handleDelete = async pet => {
    if (!window.confirm(`Delete ${pet.name} and ALL its data?`)) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/pets/${pet.id}`,
        { withCredentials: true,  },
      );
      loadPets();
    } catch {
      alert('Could not delete pet.');
    }
  };

  const handleRecordUpload = async () => {
    if (!recordFile || !recordPet) return;
    setRecordUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', recordFile);
      formData.append('petId', recordPet.id);
      formData.append('isClinic', 'false'); 
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/medical-record/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data', },
          withCredentials: true,
        }
      );
      notifications.show({ color: 'green', message: 'Medical record uploaded!' });
      closeRecord();
    } catch (err) {
      notifications.show({ color: 'red', message: 'Failed to upload record.' });
    } finally {
      setRecordUploading(false);
    }
  };

  const fetchMedicalRecords = async (petId) => {
    setLoadingRecords(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/medical-record/pet/${petId}`,
        { withCredentials: true,  }
      );
      setMedicalRecords(data);
    } catch (err) {
      setMedicalRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (recordPet && activeTab === 'view') {
      fetchMedicalRecords(recordPet.id);
    }
  }, [recordPet, activeTab, ]);

  
  const getUniqueRecords = (records) => {
    const seen = new Set();
    return records.filter(record => {
      const key = `${record.petId}-${record.fileName}-${record.createdAt ? new Date(record.createdAt).toISOString().slice(0,10) : ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  if (loading) {
    return (
      <Center style={{ minHeight: '50vh' }}>
        <motion.div
          variants={loaderVariants}
          initial="hidden"
          animate="visible"
        >
          <Loader size="xl" />
        </motion.div>
      </Center>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <SimpleGrid
          cols={{ base: 1, md: 2 }}
          spacing={{ base: 'md', md: 'lg' }}
        >
          <AnimatePresence>
            {pets.map((pet, index) => (
              <MotionCard
                key={pet.id}
                shadow="sm"
                radius="md"
                withBorder
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
                layout
              >
                <MotionStack align="center" spacing="sm" py="md">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <Text fw={600} size={isMobile ? "lg" : "md"} style={{
                      background: 'black',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textAlign: 'center'
                    }}>
                      {pet.name}
                    </Text>
                    <Group position="center" mt={4}>
                      <Badge color={pet.neutered ? 'green' : 'gray'} size="sm">
                        {pet.neutered ? 'Neutered' : 'Not Neutered'}
                      </Badge>
                      <Badge color="blue" size="sm">
                        {pet.build ? pet.build.charAt(0) + pet.build.slice(1).toLowerCase() : 'Build'}
                      </Badge>
                    </Group>
                  </motion.div>

                    <MotionImage
                      src={getPetImageSrc(pet)}
                      alt={pet.name}
                      w={isMobile ? '70vw' : 200}
                      h={isMobile ? '70vw' : 200}
                      radius="50%"
                      fit="cover"
                      variants={imageVariants}
                      whileHover="hover"
                      whileTap="tap"
                      style={{
                        border: '3px solid transparent',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                      }}
                      onClick={() => openEdit(pet)}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: index * 0.1 + 0.4,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                      }}
                    />


                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <Text size={isMobile ? "md" : "sm"} c="dimmed" ta="center">
                      {pet.breed}
                      {pet.birthdate && (
                        <>
                          {' · '}
                          <IconCalendar size={isMobile ? 18 : 14} style={{ verticalAlign: 'middle', marginRight: 2, marginBottom: 2 }} />
                          {format(new Date(pet.birthdate), 'dd-MM-yyyy')}
                        </>
                      )}
                      {pet.birthdate && (() => { const age = calculateAge(pet.birthdate); return age ? ` · ${age.years}y ${age.months}m` : ''; })()}
                      {pet.weight ? ` · ${pet.weight} kg` : ''}
                    </Text>
                  </motion.div>

                  <MotionGroup 
                    position="center" 
                    spacing="md" 
                    mt="sm"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      delay: index * 0.1 + 0.6,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                  >
                    <MotionActionIcon 
                      variant="gradient" 
                      gradient={{ from: 'blue', to: 'cyan' }}
                      size={isMobile ? "lg" : "xl"} 
                      onClick={(e) => { e.stopPropagation(); openEdit(pet); }} 
                      title="Edit"
                      variants={actionIconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      style={{ borderRadius: '50%' }}
                    >
                      <IconEdit size={isMobile ? 24 : 28} />
                    </MotionActionIcon>

                    <MotionActionIcon 
                      variant="gradient" 
                      gradient={{ from: 'teal', to: 'lime' }}
                      size={isMobile ? "lg" : "xl"}
                      onClick={(e) => { e.stopPropagation(); openImage(pet); }} 
                      title="Change Photo"
                      variants={actionIconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      style={{ borderRadius: '50%' }}
                    >
                      <IconPhoto size={isMobile ? 24 : 28} />
                    </MotionActionIcon>

                    <MotionActionIcon 
                      variant="gradient" 
                      gradient={{ from: 'grape', to: 'pink' }}
                      size={isMobile ? "lg" : "xl"}
                      onClick={(e) => { e.stopPropagation(); openRecord(pet); }} 
                      title="Upload Medical Record"
                      variants={actionIconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      style={{ borderRadius: '50%' }}
                    >
                      <IconUpload size={isMobile ? 24 : 28} />
                    </MotionActionIcon>

                    <MotionActionIcon 
                      variant="gradient" 
                      gradient={{ from: 'red', to: 'orange' }}
                      size={isMobile ? "lg" : "xl"}
                      onClick={(e) => { e.stopPropagation(); handleDelete(pet); }} 
                      title="Delete"
                      variants={actionIconVariants}
                      whileHover="hover"
                      whileTap="tap"
                      style={{ borderRadius: '50%' }}
                    >
                      <IconTrash size={isMobile ? 24 : 28} />
                    </MotionActionIcon>
                  </MotionGroup>
                </MotionStack>
              </MotionCard>
            ))}
          </AnimatePresence>

          <MotionCard
            shadow="sm"
            radius="md"
            withBorder
            variants={addCardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="tap"
            style={{
              border: '2px dashed #ccc',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              minHeight: isMobile ? 250 : 200,
              background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={openAddModal}
          >
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                opacity: 0
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <Stack align="center" spacing="sm" style={{ zIndex: 1 }}>
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <IconPaw size={isMobile ? 50 : 40} color="#ccc" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Text fw={600} size={isMobile ? "xl" : "lg"} color="dimmed">
                  Add New Pet
                </Text>
              </motion.div>
            </Stack>
          </MotionCard>
        </SimpleGrid>
      </motion.div>


      <AnimatePresence>
        {editModalOpen && (
          <Modal 
            opened={editModalOpen} 
            onClose={closeEdit}
            title={selectedPet && `Edit ${selectedPet.name}`} 
            centered
            styles={{
              content: {
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              }
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {selectedPet && (
                <EditPetForm
                  pet={selectedPet}
                  onClose={closeEdit}
                  onRefresh={() => { closeEdit(); loadPets(); }}
                />
              )}
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {imagePet && (
          <Modal 
            opened={!!imagePet} 
            onClose={closeImage}
            title={imagePet && `Change Photo: ${imagePet.name}`} 
            centered
            styles={{
              content: {
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              }
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ImageUploader
                petName={imagePet.name}
                onSuccess={() => { closeImage(); loadPets(); }}
              />
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {recordPet && (
          <Modal 
            opened={!!recordPet} 
            onClose={closeRecord}
            title={recordPet && `Medical Records: ${recordPet.name}`} 
            centered
            size="lg"
            styles={{
              content: {
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                borderRadius: '1rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              },
              header: {
                background: 'transparent',
                borderBottom: '1px solid #e9ecef',
                padding: '1rem 1.5rem',
              },
              title: {
                fontWeight: 700,
                fontSize: '1.25rem'
              },
              body: {
                padding: '1.5rem',
              }
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
                <Tabs.List grow>
                  <Tabs.Tab value="upload">
                    <Group spacing="xs">
                      <IconUpload size={16} />
                      <Text fw={500}>Upload New</Text>
                    </Group>
                  </Tabs.Tab>
                  <Tabs.Tab value="view">
                    <Group spacing="xs">
                      <IconFileDescription size={16} />
                      <Text fw={500}>View Records</Text>
                    </Group>
                  </Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="upload" pt="lg" keepMounted>
                  <Box ref={uploadPanelRef}>
                    <Stack sx={{ height: panelsHeight, justifyContent: 'space-between' }}>
                      <Stack>
                        <Text size="sm" c="dimmed" ta="center">Select a PDF or image file to upload as a medical record for this pet.</Text>
                        <Box
                          p="lg"
                          sx={(theme) => ({
                            border: `2px dashed ${recordFile ? theme.colors.green[6] : theme.colors.gray[4]}`,
                            borderRadius: '8px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s, background-color 0.2s',
                            backgroundColor: recordFile ? theme.fn.lighten(theme.colors.green[0], 0.5) : 'transparent',
                            '&:hover': {
                              backgroundColor: recordFile ? theme.fn.lighten(theme.colors.green[0], 0.4) : theme.fn.lighten(theme.colors.gray[0], 0.5),
                            }
                          })}
                        >
                          <input
                            type="file"
                            accept="application/pdf,image/*"
                            onChange={e => setRecordFile(e.target.files[0])}
                            disabled={recordUploading}
                            style={{ display: 'none' }}
                            id="record-file-input"
                          />
                          <label htmlFor="record-file-input" style={{ cursor: 'pointer', display: 'block' }}>
                            <Stack align="center">
                              <IconUpload size={48} color={recordFile ? '#40c057' : "#adb5bd"} />
                              <Text fw={500} size="md">
                                {recordFile ? 'File selected!' : 'Click to select a file'}
                              </Text>
                              <Text c="dimmed" size="sm">
                                {recordFile ? recordFile.name : 'or drag and drop here'}
                              </Text>
                            </Stack>
                          </label>
                        </Box>
                      </Stack>
                      
                      <Button
                        onClick={handleRecordUpload}
                        loading={recordUploading}
                        disabled={!recordFile}
                        gradient={{ from: 'blue', to: 'purple' }}
                        variant="gradient"
                        fullWidth
                        size="md"
                        radius="md"
                      >
                        Upload Record
                      </Button>
                    </Stack>
                  </Box>
                </Tabs.Panel>
                <Tabs.Panel value="view" pt="lg" keepMounted>
                  <Box ref={viewPanelRef}>
                    {loadingRecords ? (
                      <Center sx={{ height: panelsHeight }}>
                        <Loader />
                      </Center>
                    ) : (
                      <Stack sx={{ height: panelsHeight }} justify={medicalRecords.length === 0 ? 'center' : 'flex-start'}>
                        {medicalRecords.length === 0 ? (
                          <Text ta="center" c="dimmed" py="xl">No records found for this pet.</Text>
                        ) : (
                          <Box sx={{ flex: 1, overflowY: 'auto', pr: 4 }}>
                            <Stack>
                              {getUniqueRecords(medicalRecords).map((record) => (
                                <Paper
                                  key={record.id}
                                  withBorder
                                  p="sm"
                                  radius="md"
                                  shadow="xs"
                                  sx={(theme) => ({
                                    transition: 'background-color 0.2s ease',
                                    '&:hover': {
                                      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
                                    }
                                  })}
                                >
                                  <Group position="apart">
                                    <Group>
                                      <ThemeIcon variant="light" size="lg" radius="md">
                                        <IconFileDescription size={24} />
                                      </ThemeIcon>
                                      <Stack spacing={0}>
                                        <Text fw={500} lineClamp={1}>{record.fileName}</Text>
                                        {record.createdAt && (
                                          <Text size="xs" color="dimmed">
                                            {format(new Date(record.createdAt), 'dd MMM yyyy, HH:mm')}
                                          </Text>
                                        )}
                                      </Stack>
                                    </Group>
                                    <Group>
                                      <Button
                                        size="xs"
                                        variant="gradient"
                                        gradient={{ from: 'teal', to: 'blue' }}
                                        onClick={async () => {
                                          try {
                                            const { data: url } = await axios.get(
                                              `${process.env.REACT_APP_API_URL}/api/medical-record/download/${record.id}`,
                                              { withCredentials: true,  }
                                            );
                                            window.open(url, '_blank');
                                          } catch (err) {
                                            notifications.show({ color: 'red', message: 'Could not get download link.' });
                                          }
                                        }}
                                      >
                                        Download
                                      </Button>
                                      <Button
                                        size="xs"
                                        variant="gradient"
                                        gradient={{ from: 'red', to: 'orange' }}
                                        onClick={async () => {
                                          if (!window.confirm('Are you sure you want to delete this record?')) return;
                                          try {
                                            await axios.delete(
                                              `${process.env.REACT_APP_API_URL}/api/medical-record/${record.id}`,
                                              { withCredentials: true,  }
                                            );
                                            fetchMedicalRecords(recordPet.id);
                                            notifications.show({ color: 'green', message: 'Record deleted.' });
                                          } catch (err) {
                                            notifications.show({ color: 'red', message: 'Failed to delete record.' });
                                          }
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </Group>
                                  </Group>
                                </Paper>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    )}
                  </Box>
                </Tabs.Panel>
              </Tabs>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addModalOpen && (
          <Modal 
            opened={addModalOpen} 
            onClose={closeAddModal} 
            title="Add a new pet" 
            centered
            styles={{
              content: {
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              }
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <AddPetForm onClose={closeAddModal} />
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}