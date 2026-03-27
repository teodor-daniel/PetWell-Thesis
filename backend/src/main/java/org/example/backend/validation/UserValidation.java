package org.example.backend.validation;

import org.example.backend.data.User;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.regex.Pattern;

@Service
public class UserValidation {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[\\w.-]+@([\\w-]+\\.)+[\\w-]{2,}$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(\\+40|0040|0)?[27]\\d{8}$");
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-ZÀ-ÿ\s'-]{2,50}$");
    private static final String[] ALLOWED_CITIES = {"Bucuresti", "Iasi", "Constanta", "Craiova", "Brasov", "Galati", "Ploiesti", "Pitesti"};

    public boolean isNotValid(User user) {
        return !isValidName(user.getFullName()) || !isValidEmail(user.getEmail()) || !isValidPhone(user.getPhone()) || !isValidCity(user.getCity()) || !isValidBirthdate(user.getBirthdate()) || (user.getPassword() != null && !isValidPassword(user.getPassword()));
    }

    public boolean isNotValidForUpdate(User user) {
        if (user.getFullName() != null && !isValidName(user.getFullName())) return true;
        if (user.getEmail() != null && !isValidEmail(user.getEmail())) return true;
        if (user.getPhone() != null && !isValidPhone(user.getPhone())) return true;
        if (user.getCity() != null && !isValidCity(user.getCity())) return true;
        if (user.getBirthdate() != null && !isValidBirthdate(user.getBirthdate())) return true;
        if (user.getPassword() != null && !isValidPassword(user.getPassword())) return true;
        return false;
    }

    public boolean isValidName(String name) {
        return name != null && NAME_PATTERN.matcher(name).matches();
    }

    public boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public boolean isValidPhone(String phone) {
        return phone == null || phone.isEmpty() || PHONE_PATTERN.matcher(phone).matches();
    }

    public boolean isValidCity(String city) {
        if (city == null) return false;
        for (String allowed : ALLOWED_CITIES) if (allowed.equals(city)) return true;
        return false;
    }

    public boolean isValidBirthdate(LocalDate birthdate) {
        return birthdate != null && !birthdate.isAfter(LocalDate.now().minusYears(13));
    }

    public boolean isValidPassword(String password) {
        if (password == null || password.length() < 8) return false;
        boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}
