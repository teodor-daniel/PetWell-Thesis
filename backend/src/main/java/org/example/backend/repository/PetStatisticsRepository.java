package org.example.backend.repository;

import org.example.backend.data.Pet;
import org.example.backend.data.PetStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PetStatisticsRepository extends JpaRepository<PetStatistics, UUID> {
    List<PetStatistics> findByPetOrderByChangedAtAsc(Pet pet);

    List<PetStatistics> findByPet_IdOrderByChangedAtAsc(UUID petId);

    @Modifying
    @Query("DELETE FROM PetStatistics ps WHERE ps.pet.id = :petId")
    void deleteByPetId(@Param("petId") UUID petId);
} 