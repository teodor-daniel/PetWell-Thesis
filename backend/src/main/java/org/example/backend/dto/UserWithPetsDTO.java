package org.example.backend.dto;

import java.util.List;
import java.util.UUID;

public record UserWithPetsDTO(
    UUID id,
    String fullName,
    String email,
    List<PetDTO> pets
) {} 