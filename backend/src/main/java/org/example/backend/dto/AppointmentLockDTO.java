package org.example.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AppointmentLockDTO(
    UUID id,
    UUID vetId,
    UUID userId,
    OffsetDateTime appointmentTime,
    OffsetDateTime expiresAt,
    int durationMinutes
) {} 