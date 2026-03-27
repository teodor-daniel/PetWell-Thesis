package org.example.backend.service.impl;

import org.example.backend.data.Appointment;
import org.example.backend.data.MedicalRecord;
import org.example.backend.data.Pet;
import org.example.backend.data.User;
import org.example.backend.data.PetStatistics;
import org.example.backend.dto.PetDTO;
import org.example.backend.dto.PetDTOId;
import org.example.backend.dto.PetStatisticsDTO;
import org.example.backend.exception.PetNotFoundException;
import org.example.backend.exception.UserNotFoundException;
import org.example.backend.googleApi.CloudStorageService;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.repository.MedicalRecordRepository;
import org.example.backend.repository.PetRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.PetStatisticsRepository;
import org.example.backend.service.PetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.backend.validation.PetValidation;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final CloudStorageService cloudStorageService;
    private final Environment environment;
    private final PetStatisticsRepository petStatisticsRepository;
    private final PetValidation petValidation;
    private static final Logger logger = LoggerFactory.getLogger(PetServiceImpl.class);

    @Autowired
    public PetServiceImpl(PetRepository petRepository, UserRepository userRepository, AppointmentRepository appointmentRepository, MedicalRecordRepository medicalRecordRepository, CloudStorageService cloudStorageService, Environment environment, PetStatisticsRepository petStatisticsRepository, PetValidation petValidation) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.cloudStorageService = cloudStorageService;
        this.environment = environment;
        this.petStatisticsRepository = petStatisticsRepository;
        this.petValidation = petValidation;
    }

    @Override
    public PetDTO getPetById(UUID id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException("Pet not found with ID: " + id));
        return mapToPetDTO(pet);
    }

    @Override
    public List<PetDTO> getPetsByOwnerId(UUID ownerId) {
        List<Pet> pets = petRepository.findByOwnerId(ownerId);
        return pets.stream()
                .map(this::mapToPetDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void createPet(Pet pet, UUID ownerId) {
        if (petValidation.isNotValid(pet)) {
            throw new IllegalArgumentException("Invalid pet data");
        }
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new UserNotFoundException("Owner not found with ID: " + ownerId));
        pet.setOwner(owner);
        Pet savedPet = petRepository.save(pet);
        String email = owner.getEmail();
        String petName = savedPet.getName();
        String bucket = environment.getProperty("bucket-value");
        String avatarFolder = email + "/pets/" + petName + "/avatar/";
        String recordsFolder = email + "/pets/" + petName + "/records/";
        cloudStorageService.createFolderIfMissing(bucket, avatarFolder);
        cloudStorageService.createFolderIfMissing(bucket, recordsFolder);
    }

    @Override
    public List<PetDTO> getAllPets() {
        return petRepository.findAll().stream()
                .map(this::mapToPetDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deletePet(UUID id) {
        Pet pet = petRepository.findById(id).orElseThrow(() -> new PetNotFoundException("Pet not found with ID: " + id));
        String email = pet.getOwner().getEmail();
        String petName = pet.getName();
        String bucket = environment.getProperty("bucket-value");
        String avatarFolder = email + "/pets/" + petName + "/avatar/";
        String recordsFolder = email + "/pets/" + petName + "/records/";
        logger.info("Deleting pet: {}. Deleting GCS folders: {} and {}", petName, avatarFolder, recordsFolder);

        logger.info("Looking for pet statistics for pet ID: {}", id);
        List<PetStatistics> statistics = petStatisticsRepository.findByPetOrderByChangedAtAsc(pet);
        logger.info("Found {} pet statistics records to delete", statistics.size());

        if (!statistics.isEmpty()) {
            petStatisticsRepository.deleteByPetId(id);
            petStatisticsRepository.flush();
            logger.info("Successfully deleted {} pet statistics records for pet: {}", statistics.size(), petName);
        } else {
            logger.info("No pet statistics records found for pet: {}", petName);
        }

        List<Appointment> appointments = appointmentRepository.findByPet_Id(id);
        for (Appointment appt : appointments) {
            appointmentRepository.delete(appt);
        }
        appointmentRepository.flush();

        List<MedicalRecord> records = medicalRecordRepository.findByPet_Id(id);
        for (MedicalRecord record : records) {
            if (record.getGcsPath() != null) {
                logger.info("Deleting medical record file from GCS: {}", record.getGcsPath());
                cloudStorageService.deleteObject(bucket, record.getGcsPath());
            }
            medicalRecordRepository.delete(record);
        }
        medicalRecordRepository.flush();

        cloudStorageService.deleteFolderAndContents(bucket, avatarFolder);
        cloudStorageService.deleteFolderAndContents(bucket, recordsFolder);
        logger.info("Deleted GCS folders for pet: {}", petName);

        petRepository.flush();

        petRepository.deletePetById(id);
        petRepository.flush();
    }

    @Transactional
    public void updatePetImageUrl(UUID petId, String newImageUrl) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new PetNotFoundException("Pet not found with ID: " + petId));
        pet.setImageUrl(newImageUrl);
        petRepository.save(pet);
    }

    @Override
    public PetDTO updatePet(UUID id, Pet updatedPet) {
        if (petValidation.isNotValidForUpdate(updatedPet)) {
            throw new IllegalArgumentException("Invalid pet data");
        }
        Pet existingPet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException("Pet not found with ID: " + id));

        boolean weightChanged = false;
        boolean buildChanged = false;
        BigDecimal prevWeight = existingPet.getWeight();
        Pet.Build prevBuild = existingPet.getBuild();

        if (updatedPet.getName() != null && !updatedPet.getName().isBlank()) {
            existingPet.setName(updatedPet.getName());
        }
        if (updatedPet.getSpecies() != null && !updatedPet.getSpecies().isBlank()) {
            existingPet.setSpecies(updatedPet.getSpecies());
        }
        if (updatedPet.getBreed() != null && !updatedPet.getBreed().isBlank()) {
            existingPet.setBreed(updatedPet.getBreed());
        }
        if (updatedPet.getBirthdate() != null) {
            existingPet.setBirthdate(updatedPet.getBirthdate());
        }
        if (updatedPet.getWeight() != null && updatedPet.getWeight().compareTo(BigDecimal.ZERO) >= 0) {
            if (prevWeight == null || updatedPet.getWeight().compareTo(prevWeight) != 0) {
                weightChanged = true;
            }
            existingPet.setWeight(updatedPet.getWeight());
        }
        if (updatedPet.getImageUrl() != null) {
            existingPet.setImageUrl(updatedPet.getImageUrl());
        }
        existingPet.setNeutered(updatedPet.isNeutered());
        if (updatedPet.getBuild() != null) {
            if (prevBuild == null || !updatedPet.getBuild().equals(prevBuild)) {
                buildChanged = true;
            }
            existingPet.setBuild(updatedPet.getBuild());
        }
        existingPet.setUpdatedAt(LocalDateTime.now());

        Pet savedPet = petRepository.save(existingPet);

        if (weightChanged || buildChanged) {
            PetStatistics stat = PetStatistics.builder()
                    .pet(savedPet)
                    .previousWeight(prevWeight)
                    .currentWeight(savedPet.getWeight())
                    .previousBuild(prevBuild != null ? prevBuild.name() : null)
                    .currentBuild(savedPet.getBuild() != null ? savedPet.getBuild().name() : null)
                    .changedAt(java.time.OffsetDateTime.now())
                    .build();
            petStatisticsRepository.save(stat);
        }

        return mapToPetDTO(savedPet);
    }

    @Override
    public List<PetDTOId> getAllPetsWithIDByOwnerID(UUID id) {
        List<Pet> petList = petRepository.findByOwnerId(id);
        return petList.stream().map(this::mapToPetDTOId)
                .collect(Collectors.toList());
    }

    public Optional<Pet> findPetByName(String name) {
        return Optional.ofNullable(petRepository.findPetByName(name));
    }

    public Optional<Pet> findPetByNameAndOwnerId(String name, UUID ownerId) {
        return petRepository.findByNameAndOwnerId(name, ownerId);
    }

    @Override
    public Pet findById(UUID id) {
        return petRepository.findById(id).orElseThrow(() -> new PetNotFoundException("Pet not found"));
    }


    public void verifyOwnership(UUID petId, UUID userId) {
        Pet pet = findById(petId);
        if (!pet.getOwner().getId().equals(userId)) {
            throw new AccessDeniedException("Not your pet.");
        }
    }

    public PetDTOId mapToPetDTOId(Pet pet) {
        return new PetDTOId(
                pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getBreed(),
                pet.getBirthdate(),
                pet.getWeight(),
                pet.getOwner() != null ? pet.getOwner().getId() : null,
                pet.getImageUrl()
        );
    }

    public PetDTO mapToPetDTO(Pet pet) {
        return new PetDTO(
                pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getBreed(),
                pet.getBirthdate(),
                pet.getWeight(),
                pet.getOwner() != null ? pet.getOwner().getId() : null,
                pet.getImageUrl(),
                pet.isNeutered(),
                pet.getBuild() != null ? pet.getBuild().name() : null
        );
    }

    @Override
    public List<PetStatisticsDTO> getPetStatistics(UUID petId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new PetNotFoundException("Pet not found with ID: " + petId));
        return petStatisticsRepository.findByPetOrderByChangedAtAsc(pet)
                .stream()
                .map(stat -> new PetStatisticsDTO(
                        stat.getId(),
                        stat.getPreviousWeight(),
                        stat.getCurrentWeight(),
                        stat.getPreviousBuild(),
                        stat.getCurrentBuild(),
                        stat.getChangedAt()
                ))
                .collect(Collectors.toList());
    }

}