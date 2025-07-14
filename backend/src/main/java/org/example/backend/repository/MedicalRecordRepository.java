package org.example.backend.repository;

import org.example.backend.data.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {
    List<MedicalRecord> findByPet(Pet pet);

    List<MedicalRecord> findByClinic(VeterinaryClinic clinic);

    List<MedicalRecord> findByVet(Vet vet);

    List<MedicalRecord> findByUploaderUser(User user);

    List<MedicalRecord> findByPet_Id(UUID petId);

    List<MedicalRecord> findByClinic_Id(UUID clinicId);

    List<MedicalRecord> findByVet_Id(UUID vetId);

    List<MedicalRecord> findByUploaderUser_Id(UUID userId);

    @Query("""
                SELECT DISTINCT a.pet FROM Appointment a
                WHERE a.clinic.id = :clinicId
                  AND a.status = 'CONFIRMED'
            """)
    List<org.example.backend.data.Pet> findDistinctConfirmedPetsByClinicId(@Param("clinicId") UUID clinicId);
} 