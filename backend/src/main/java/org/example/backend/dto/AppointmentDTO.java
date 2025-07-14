/* src/main/java/org/example/backend/dto/AppointmentDTO.java */
package org.example.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AppointmentDTO(
        UUID id,
        UUID petId,
        String petName,
        UUID vetId,
        String vetName,
        UUID clinicId,
        OffsetDateTime appointmentDate,
        String status,
        String notes,
        UUID petOwnerId,
        String petOwnerName,
        String petOwnerPhone,
        String type
) {}
