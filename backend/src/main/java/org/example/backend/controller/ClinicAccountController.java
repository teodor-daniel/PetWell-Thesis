package org.example.backend.controller;

import org.example.backend.dto.ClinicAccountDTO;
import org.example.backend.service.ClinicAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/clinic-accounts")
public class ClinicAccountController {

    private final ClinicAccountService clinicAccountService;

    @Autowired
    public ClinicAccountController(ClinicAccountService clinicAccountService) {
        this.clinicAccountService = clinicAccountService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or @clinicAccountService.hasClinicAccess(authentication.name, #request.get('clinicId'))")
    public ResponseEntity<ClinicAccountDTO> createClinicAccount(@RequestBody Map<String, String> request) {
        UUID clinicId = UUID.fromString(request.get("clinicId"));
        UUID userId = UUID.fromString(request.get("userId"));
        String staffRole = request.get("staffRole");

        ClinicAccountDTO account = clinicAccountService.createClinicAccount(clinicId, userId, staffRole);
        return ResponseEntity.ok(account);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("authentication.name == #userId.toString() or hasRole('ADMIN')")
    public ResponseEntity<List<ClinicAccountDTO>> getClinicAccountsByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(clinicAccountService.getClinicAccountsByUserId(userId));
    }

    @GetMapping("/clinic/{clinicId}")
    @PreAuthorize("@clinicAccountService.hasClinicAccess(authentication.name, #clinicId) or hasRole('ADMIN')")
    public ResponseEntity<List<ClinicAccountDTO>> getClinicAccountsByClinic(@PathVariable UUID clinicId) {
        return ResponseEntity.ok(clinicAccountService.getClinicAccountsByClinicId(clinicId));
    }

    @DeleteMapping("/{clinicId}/{userId}")
    @PreAuthorize("hasRole('ADMIN') or (@clinicAccountService.hasClinicAccess(authentication.name, #clinicId) and hasRole('OWNER'))")
    public ResponseEntity<Void> deleteClinicAccount(@PathVariable UUID clinicId, @PathVariable UUID userId) {
        clinicAccountService.deleteClinicAccount(clinicId, userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{clinicId}/{userId}/role")
    @PreAuthorize("hasRole('ADMIN') or (@clinicAccountService.hasClinicAccess(authentication.name, #clinicId) and hasRole('OWNER'))")
    public ResponseEntity<Void> updateStaffRole(@PathVariable UUID clinicId, @PathVariable UUID userId, @RequestBody Map<String, String> request) {
        String newRole = request.get("staffRole");
        clinicAccountService.updateStaffRole(clinicId, userId, newRole);
        return ResponseEntity.ok().build();
    }
}