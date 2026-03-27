package org.example.backend.dto;

import java.util.UUID;

public record VeterinaryClinicDTO(
        UUID id,
        String name,
        String address,
        String phone,
        String email,
        String city,
        double latitude,
        double longitude
) {
}