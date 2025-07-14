package org.example.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateAppointmentLockRequestDTO(
    UUID vetId,
    OffsetDateTime appointmentTime,
    int durationMinutes
) {}
