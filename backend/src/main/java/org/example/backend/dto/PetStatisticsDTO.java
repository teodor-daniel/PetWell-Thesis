package org.example.backend.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PetStatisticsDTO(
    UUID id,
    BigDecimal previousWeight,
    BigDecimal currentWeight,
    String previousBuild,
    String currentBuild,
    OffsetDateTime changedAt
) {} 