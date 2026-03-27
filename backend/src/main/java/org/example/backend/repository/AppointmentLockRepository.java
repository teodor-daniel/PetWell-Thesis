package org.example.backend.repository;

import org.example.backend.data.AppointmentLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentLockRepository extends JpaRepository<AppointmentLock, UUID> {

    Optional<AppointmentLock> findByVetIdAndAppointmentTime(UUID vetId, OffsetDateTime appointmentTime);

    void deleteAllByExpiresAtBefore(OffsetDateTime now);

    Optional<AppointmentLock> findByUserId(UUID userId);

    void deleteByUserId(UUID userId);
} 