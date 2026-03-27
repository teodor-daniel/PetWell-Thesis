package org.example.backend.dto;

import java.util.UUID;
public record VetDTO(
        UUID   id,
        String fullName,
        String password,
        String email,
        String phone,
        UUID   clinicId,
        String specialities,
        Boolean isActive
) {}
