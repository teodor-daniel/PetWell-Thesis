package org.example.backend.dto;

import java.time.LocalDate;
import java.util.UUID;

public record UserDTO(
    UUID id,
    String fullName,
    String email,
    LocalDate birthdate,
    String street,
    String city,
    String phone,
    String role
) {}
