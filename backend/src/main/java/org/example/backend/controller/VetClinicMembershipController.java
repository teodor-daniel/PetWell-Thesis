package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.data.VetClinicMembership;
import org.example.backend.service.VetClinicMembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vet-clinic-memberships")
@RequiredArgsConstructor
public class VetClinicMembershipController {

    private final VetClinicMembershipService service;

    @GetMapping("/vet/{vetId}")
    public List<UUID> clinicsForVet(@PathVariable UUID vetId) {
        return service.clinicsForVet(vetId);
    }

    @GetMapping("/clinic/{clinicId}")
    public List<UUID> vetsForClinic(@PathVariable UUID clinicId) {
        return service.vetsForClinic(clinicId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or " + "@clinicAccountService.hasClinicAccess(authentication.name, #clinicId)")
    public ResponseEntity<Void> addLink(@RequestParam UUID vetId, @RequestParam UUID clinicId, @RequestParam(defaultValue = "PRIMARY") VetClinicMembership.Role role) {
        service.add(vetId, clinicId, role);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN') or " + "@clinicAccountService.hasClinicAccess(authentication.name, #clinicId)")
    public ResponseEntity<Void> deleteLink(@RequestParam UUID vetId, @RequestParam UUID clinicId) {

        service.remove(vetId, clinicId);
        return ResponseEntity.noContent().build();
    }

}
