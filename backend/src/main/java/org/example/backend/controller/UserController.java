package org.example.backend.controller;

import jakarta.validation.Valid;
import org.example.backend.data.User;
import org.example.backend.dto.UserDTO;
import org.example.backend.dto.UserWithPetsDTO;
import org.example.backend.service.ClinicAccountService;
import org.example.backend.service.UserService;
import org.example.backend.validation.UserValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final UserValidation userValidation;
    private final ClinicAccountService clinicAccountService;

    @Autowired
    public UserController(UserService userService, UserValidation userValidation, ClinicAccountService clinicAccountService) {
        this.userService = userService;
        this.userValidation = userValidation;
        this.clinicAccountService = clinicAccountService;
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        UUID myId = UUID.fromString(userDetails.getUsername());
        if (!myId.equals(id) && !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        UserDTO userDTO = userService.getUserById(id);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> userList = userService.getUsers();
        return ResponseEntity.ok(userList);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@Valid @RequestBody User user) {
        if (userValidation.isNotValid(user)) {
            return ResponseEntity.badRequest().body("Invalid user data");
        }
        userService.createUser(user);
        return ResponseEntity.ok(HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("#id.toString() == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<?> updateUserById(@PathVariable UUID id, @Valid @RequestBody User updatedUser, @AuthenticationPrincipal UserDetails userDetails) {
        if (userValidation.isNotValidForUpdate(updatedUser)) {
            return ResponseEntity.badRequest().body("Invalid user data");
        }
        UserDTO updated = userService.updateUser(id, updatedUser);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("#id.toString() == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserById(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        if (!id.toString().equals(userDetails.getUsername()) && !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"))) {
            var clinicAccounts = clinicAccountService.getClinicAccountsByUserId(id);
            if (!clinicAccounts.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
        }

        userService.deleteUserAndAllData(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('VET', 'OWNER', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(@RequestParam String query) {
        List<Map<String, Object>> usersWithPets = userService.searchUsersWithPets(query);
        return ResponseEntity.ok(usersWithPets);
    }

    @GetMapping("/clinic/{clinicId}/confirmed-users")
    @PreAuthorize("@clinicAccountService.hasClinicAccess(authentication.name, #clinicId) or hasRole('ADMIN')")
    public ResponseEntity<List<UserWithPetsDTO>> getConfirmedUsersForClinic(@PathVariable UUID clinicId) {
        List<UserWithPetsDTO> users = userService.getUsersWithConfirmedAppointmentsAtClinic(clinicId);
        return ResponseEntity.ok(users);
    }
}
