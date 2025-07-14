package org.example.backend.service;

import org.example.backend.data.User;
import org.example.backend.dto.UserDTO;
import org.example.backend.dto.UserWithPetsDTO;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface UserService {

    UserDTO getUserById(UUID id);

    UserDTO getUserByFullName(String fullName);

    Optional<User> findByEmail(String email);

    void createUser(User user);

    List<User> getUsers();

    boolean checkPassword(String rawPassword, String encodedPassword);

    User registerUser(User user);

    void deleteUser(User user);

    void deleteUserById(UUID id);

    UserDTO updateUser(UUID id, User updatedUser);

    void deleteUserAndAllData(UUID userId);

    List<Map<String, Object>> searchUsersWithPets(String query);

    List<UserWithPetsDTO> getUsersWithConfirmedAppointmentsAtClinic(UUID clinicId);
}
