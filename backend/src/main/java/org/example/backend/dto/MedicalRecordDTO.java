package org.example.backend.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MedicalRecordDTO(
    UUID id,
    UUID petId,
    String petName,
    String fileName,
    String gcsPath,
    OffsetDateTime createdAt,
    UUID uploaderUserId,
    String uploaderUserName,
    UUID vetId,
    String vetName,
    UUID clinicId,
    String clinicName
) {} 