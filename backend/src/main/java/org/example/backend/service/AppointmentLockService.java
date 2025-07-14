package org.example.backend.service;

import org.example.backend.data.AppointmentLock;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

public interface AppointmentLockService {
    AppointmentLock createLock(UUID vetId, OffsetDateTime appointmentTime, UUID userId, int durationMinutes);

    void releaseLock(UUID lockId, UUID userId);

    Optional<AppointmentLock> getCurrentLock(UUID userId);
} 