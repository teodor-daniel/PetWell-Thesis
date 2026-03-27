package org.example.backend.repository;

import org.example.backend.data.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PetRepository extends JpaRepository<Pet, UUID> {

    List<Pet> findByOwnerId(UUID ownerId);

    Pet findPetByName(String petName);

    Optional<Pet> findByNameAndOwnerId(String name, UUID ownerId);

    @Modifying
    @Query("DELETE FROM Pet p WHERE p.id = :petId")
    void deletePetById(@Param("petId") UUID petId);
}