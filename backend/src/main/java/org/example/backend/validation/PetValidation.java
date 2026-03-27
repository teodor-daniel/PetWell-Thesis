package org.example.backend.validation;

import org.example.backend.data.Pet;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class PetValidation {
    public boolean isNotValid(Pet pet) {
        return !isValidName(pet.getName()) || !isValidSpecies(pet.getSpecies()) || !isValidBreed(pet.getBreed()) || !isValidBirthdate(pet.getBirthdate()) || !isValidWeight(pet.getWeight()) || !isValidBuild(pet.getBuild());
    }

    public boolean isNotValidForUpdate(Pet pet) {
        if (pet.getName() != null && !isValidName(pet.getName())) return true;
        if (pet.getSpecies() != null && !isValidSpecies(pet.getSpecies())) return true;
        if (pet.getBreed() != null && !isValidBreed(pet.getBreed())) return true;
        if (pet.getBirthdate() != null && !isValidBirthdate(pet.getBirthdate())) return true;
        if (pet.getWeight() != null && !isValidWeight(pet.getWeight())) return true;
        if (pet.getBuild() != null && !isValidBuild(pet.getBuild())) return true;
        return false;
    }

    public boolean isValidName(String name) {
        return name != null && name.matches("^[a-zA-ZÀ-ÿ\s'-]{2,30}$");
    }

    public boolean isValidSpecies(String species) {
        return "Dog".equals(species) || "Cat".equals(species);
    }

    public boolean isValidBreed(String breed) {
        return breed != null && !breed.isBlank();
    }

    public boolean isValidBirthdate(LocalDate birthdate) {
        return birthdate != null && !birthdate.isAfter(LocalDate.now());
    }

    public boolean isValidWeight(java.math.BigDecimal weight) {
        return weight != null && weight.compareTo(java.math.BigDecimal.ZERO) >= 0;
    }

    public boolean isValidBuild(Pet.Build build) {
        return build != null && (build == Pet.Build.SMALL || build == Pet.Build.MEDIUM || build == Pet.Build.LARGE);
    }
} 