package org.example.backend.service.impl;

import org.example.backend.data.User;
import org.example.backend.dto.UserDTO;
import org.example.backend.dto.UserWithPetsDTO;
import org.example.backend.dto.PetDTO;
import org.example.backend.exception.UserNotFoundException;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.PetRepository;
import org.example.backend.repository.MedicalRecordRepository;
import org.example.backend.repository.ClinicAccountRepository;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.service.UserService;
import org.example.backend.service.PetService;
import org.example.backend.validation.UserValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserValidation userValidation;
    private final PasswordEncoder passwordEncoder;
    private final PetRepository petRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final ClinicAccountRepository clinicAccountRepository;
    private final PetService petService;
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, UserValidation userValidation, PasswordEncoder passwordEncoder,
                           PetRepository petRepository, MedicalRecordRepository medicalRecordRepository,
                           ClinicAccountRepository clinicAccountRepository, PetService petService,
                           AppointmentRepository appointmentRepository) {
        this.userRepository = userRepository;
        this.userValidation = userValidation;
        this.passwordEncoder = passwordEncoder;
        this.petRepository = petRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.clinicAccountRepository = clinicAccountRepository;
        this.petService = petService;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public UserDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));
        return mapToUserDTO(user);
    }

    @Override
    public UserDTO getUserByFullName(String fullName) {
        User user = userRepository.findByFullName(fullName)
                .orElseThrow(() -> new UserNotFoundException("User not found with full name: " + fullName));
        return mapToUserDTO(user);
    }

    @Override
    public void createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (userValidation.isNotValid(user)) {
            throw new UserNotFoundException("User is not correct: " + user.toString());
        }
        userRepository.save(user);
    }

    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public User registerUser(User user) {
        if (user.getPassword() == null) {
            user.setPassword(passwordEncoder.encode("oauth2user"));
        }
        user.setRole("user");
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    @Override
    public void deleteUser(User user) {
        userRepository.delete(user);
    }

    @Override
    public void deleteUserById(UUID id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserDTO updateUser(UUID id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + id));

        if (updatedUser.getFullName() != null && !updatedUser.getFullName().isBlank()) {
            user.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getPhone() != null && !updatedUser.getPhone().isBlank()) {
            user.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getCity() != null && !updatedUser.getCity().isBlank()) {
            user.setCity(updatedUser.getCity());
        }
        if (updatedUser.getBirthdate() != null) {
            user.setBirthdate(updatedUser.getBirthdate());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return mapToUserDTO(savedUser);
    }

    @Override
    @Transactional
    public void deleteUserAndAllData(UUID userId) {

        var pets = petRepository.findByOwnerId(userId);
        for (var pet : pets) {
            petService.deletePet(pet.getId());
        }

        var userRecords = medicalRecordRepository.findByUploaderUser_Id(userId);
        for (var record : userRecords) {
            medicalRecordRepository.delete(record);
        }
        clinicAccountRepository.deleteById_UserId(userId);
        userRepository.deleteById(userId);
    }

    @Override
    public List<Map<String, Object>> searchUsersWithPets(String query) {
        List<User> users = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
        return users.stream().map(user -> {
            Map<String, Object> userMap = new java.util.HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("fullName", user.getFullName());
            userMap.put("email", user.getEmail());

            var pets = petRepository.findByOwnerId(user.getId());
            userMap.put("pets", pets.stream().map(pet -> {
                Map<String, Object> petMap = new java.util.HashMap<>();
                petMap.put("id", pet.getId());
                petMap.put("name", pet.getName());
                petMap.put("species", pet.getSpecies());
                petMap.put("breed", pet.getBreed());
                return petMap;
            }).toList());

            return userMap;
        }).toList();
    }

    @Override
    public List<UserWithPetsDTO> getUsersWithConfirmedAppointmentsAtClinic(UUID clinicId) {
        List<org.example.backend.data.Pet> pets = appointmentRepository.findDistinctConfirmedPetsByClinicId(clinicId);

        Map<org.example.backend.data.User, List<org.example.backend.data.Pet>> petsByOwner = pets.stream()
                .collect(Collectors.groupingBy(org.example.backend.data.Pet::getOwner));

        List<UserWithPetsDTO> result = new ArrayList<>();
        for (var entry : petsByOwner.entrySet()) {
            org.example.backend.data.User owner = entry.getKey();
            List<PetDTO> petDTOs = entry.getValue().stream().map(PetDTO::fromEntity).toList();
            result.add(new UserWithPetsDTO(owner.getId(), owner.getFullName(), owner.getEmail(), petDTOs));
        }
        return result;
    }

    private UserDTO mapToUserDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getBirthdate(),
                user.getStreet(),
                user.getCity(),
                user.getPhone(),
                user.getRole()
        );
    }
}

