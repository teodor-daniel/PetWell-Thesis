/* src/main/java/org/example/backend/repository/AppointmentRepository.java */
package org.example.backend.repository;

import org.example.backend.data.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    List<Appointment> findByVet_IdAndAppointmentDateBetween(UUID vetId, OffsetDateTime from, OffsetDateTime to);


    List<Appointment> findByClinic_IdAndAppointmentDateBetween(UUID clinicId, OffsetDateTime from, OffsetDateTime to);


    @Query("""
               select a from Appointment a
               where a.pet.owner.id = :ownerId
                 and a.appointmentDate between :from and :to
            """)
    List<Appointment> findForOwner(UUID ownerId, OffsetDateTime from, OffsetDateTime to);

    List<Appointment> findByPet_Id(UUID petId);

    java.util.Optional<Appointment> findByVet_IdAndAppointmentDate(UUID vetId, OffsetDateTime appointmentDate);

    @Query(value = """
                SELECT a.* FROM dev.appointments a
                JOIN dev.pets p ON a.pet_id = p.id
                JOIN dev.users u ON p.owner_id = u.id
                WHERE a.clinic_id = :clinicId
                  AND (CAST(a.appointment_date AS date) BETWEEN :from AND :to)
                  AND (:petName IS NULL OR TRIM(p.name) ILIKE CONCAT('%', TRIM(:petName), '%'))
                  AND (:petOwnerName IS NULL OR TRIM(u.full_name) ILIKE CONCAT('%', TRIM(:petOwnerName), '%'))
                ORDER BY a.appointment_date DESC
            """, countQuery = """
                SELECT count(*) FROM dev.appointments a
                JOIN dev.pets p ON a.pet_id = p.id
                JOIN dev.users u ON p.owner_id = u.id
                WHERE a.clinic_id = :clinicId
                  AND (CAST(a.appointment_date AS date) BETWEEN :from AND :to)
                  AND (:petName IS NULL OR TRIM(p.name) ILIKE CONCAT('%', TRIM(:petName), '%'))
                  AND (:petOwnerName IS NULL OR TRIM(u.full_name) ILIKE CONCAT('%', TRIM(:petOwnerName), '%'))
            """, nativeQuery = true)
    Page<Appointment> searchPastAppointments(@Param("clinicId") UUID clinicId, @Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to, @Param("petName") String petName, @Param("petOwnerName") String petOwnerName, Pageable pageable);

    /* Paginated past appointments for an owner with optional pet name and pet owner name filter */
    @Query(value = """
                SELECT a.* FROM dev.appointments a
                JOIN dev.pets p ON a.pet_id = p.id
                JOIN dev.users u ON p.owner_id = u.id
                WHERE p.owner_id = :ownerId
                  AND (:petName IS NULL OR TRIM(p.name) ILIKE CONCAT('%', TRIM(:petName), '%'))
                  AND (:petOwnerName IS NULL OR TRIM(u.full_name) ILIKE CONCAT('%', TRIM(:petOwnerName), '%'))
                ORDER BY a.appointment_date DESC
            """, countQuery = """
                SELECT count(*) FROM dev.appointments a
                JOIN dev.pets p ON a.pet_id = p.id
                JOIN dev.users u ON p.owner_id = u.id
                WHERE p.owner_id = :ownerId
                  AND (:petName IS NULL OR TRIM(p.name) ILIKE CONCAT('%', TRIM(:petName), '%'))
                  AND (:petOwnerName IS NULL OR TRIM(u.full_name) ILIKE CONCAT('%', TRIM(:petOwnerName), '%'))
            """, nativeQuery = true)
    Page<Appointment> searchPastAppointmentsByOwner(@Param("ownerId") UUID ownerId, @Param("petName") String petName, @Param("petOwnerName") String petOwnerName, Pageable pageable);

    @Query(value = """
                SELECT a.* FROM dev.appointments a
                JOIN dev.pets p ON a.pet_id = p.id
                JOIN dev.users u ON p.owner_id = u.id
                WHERE a.vet_id = :vetId
                  AND (:petName IS NULL OR TRIM(p.name) ILIKE CONCAT('%', TRIM(:petName), '%'))
                  AND (:petOwnerName IS NULL OR TRIM(u.full_name) ILIKE CONCAT('%', TRIM(:petOwnerName), '%'))
                ORDER BY a.appointment_date DESC
            """, countQuery = """
                SELECT count(*) FROM dev.appointments a
                JOIN dev.pets p ON a.pet_id = p.id
                JOIN dev.users u ON p.owner_id = u.id
                WHERE a.vet_id = :vetId
                  AND (:petName IS NULL OR TRIM(p.name) ILIKE CONCAT('%', TRIM(:petName), '%'))
                  AND (:petOwnerName IS NULL OR TRIM(u.full_name) ILIKE CONCAT('%', TRIM(:petOwnerName), '%'))
            """, nativeQuery = true)
    Page<Appointment> searchPastAppointmentsByVet(@Param("vetId") UUID vetId, @Param("petName") String petName, @Param("petOwnerName") String petOwnerName, Pageable pageable);

    @Query("""
                SELECT DISTINCT a.pet FROM Appointment a
                WHERE a.clinic.id = :clinicId
                  AND a.status = 'CONFIRMED'
            """)
    List<org.example.backend.data.Pet> findDistinctConfirmedPetsByClinicId(@Param("clinicId") UUID clinicId);

    @Query("""
                SELECT COUNT(a) FROM Appointment a
                WHERE a.vet.id = :vetId
                  AND (a.status = 'PENDING' OR a.status = 'ACCEPTED')
            """)
    long countByVetIdAndStatusPendingOrAccepted(@Param("vetId") UUID vetId);

    long countByClinic_Id(UUID clinicId);

    @Query("""
                SELECT COUNT(a) FROM Appointment a
                WHERE a.clinic.id = :clinicId
                  AND a.status = 'CONFIRMED'
                  AND a.appointmentDate > :now
            """)
    long countFutureConfirmedAppointmentsByClinicId(@Param("clinicId") UUID clinicId, @Param("now") OffsetDateTime now);

    void deleteByClinic_Id(UUID clinicId);
}
