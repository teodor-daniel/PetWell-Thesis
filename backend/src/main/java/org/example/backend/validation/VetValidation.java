package org.example.backend.validation;

import org.example.backend.dto.VetDTO;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class VetValidation {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w.-]+@([\\w-]+\\.)+[\\w-]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(\\+40|0040|0)?[27]\\d{8}$");
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ\\s'-]{2,50}$");

    public boolean isNotValid(VetDTO vet) {
        return !isValidName(vet.fullName()) || !isValidEmail(vet.email()) || !isValidPhone(vet.phone()) || !isValidSpecialities(vet.specialities()) || !isValidPassword(vet.password());
    }

    public boolean isNotValidForUpdate(VetDTO vet) {
        if (vet.fullName() != null && !isValidName(vet.fullName())) return true;
        if (vet.email() != null && !isValidEmail(vet.email())) return true;
        if (vet.phone() != null && !isValidPhone(vet.phone())) return true;
        if (vet.specialities() != null && !isValidSpecialities(vet.specialities())) return true;
        if (vet.password() != null && !isValidPassword(vet.password())) return true;
        return false;
    }

    public boolean isValidName(String name) {
        return name != null && NAME_PATTERN.matcher(name).matches();
    }

    public boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public boolean isValidPhone(String phone) {
        if (phone == null) return true;
        return PHONE_PATTERN.matcher(phone).matches();
    }

    public boolean isValidSpecialities(String specialities) {
        return specialities != null && !specialities.trim().isEmpty();
    }

    public boolean isValidPassword(String password) {
        return password != null && password.length() >= 6;
    }
}a