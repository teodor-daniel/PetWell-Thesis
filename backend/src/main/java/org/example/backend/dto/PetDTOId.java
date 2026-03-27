package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PetDTOId {

    private UUID id;
    private String name;
    private String species;
    private String breed;
    private LocalDate birthdate;
    private BigDecimal weight;
    private UUID ownerId;
    private String imageUrl;
}