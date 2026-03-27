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
public class PetDTO {

    private UUID id;
    private String name;
    private String species;
    private String breed;
    private LocalDate birthdate;
    private BigDecimal weight;
    private UUID ownerId;
    private String imageUrl;
    private boolean neutered;
    private String build;

    public static PetDTO fromEntity(org.example.backend.data.Pet pet) {
        return new PetDTO(
            pet.getId(),
            pet.getName(),
            pet.getSpecies(),
            pet.getBreed(),
            pet.getBirthdate(),
            pet.getWeight(),
            pet.getOwner().getId(),
            pet.getImageUrl(),
            pet.isNeutered(),
            pet.getBuild() != null ? pet.getBuild().name() : null
        );
    }
}