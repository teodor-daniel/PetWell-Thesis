package org.example.backend.service;

import org.example.backend.data.Pet;
import org.example.backend.dto.PetDTO;
import org.example.backend.dto.PetDTOId;
import org.example.backend.dto.PetStatisticsDTO;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PetService {

    PetDTO getPetById(UUID id);

    List<PetDTO> getPetsByOwnerId(UUID ownerId);

    void createPet(Pet pet, UUID ownerId);

    List<PetDTO> getAllPets();

    void deletePet(UUID id);

    PetDTO updatePet(UUID id, Pet updatedPet);

    List<PetDTOId> getAllPetsWithIDByOwnerID(UUID id);

    Optional<Pet> findPetByName(String petName);

    Optional<Pet> findPetByNameAndOwnerId(String petName, UUID ownerId);

    void verifyOwnership(UUID petId, UUID userId);

    Pet findById(UUID id);

    PetDTO mapToPetDTO(Pet pet);

    List<PetStatisticsDTO> getPetStatistics(UUID petId);

    void updatePetImageUrl(UUID petId, String newImageUrl);
}