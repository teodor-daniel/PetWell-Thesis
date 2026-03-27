package org.example.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.VeterinaryClinicDTO;
import org.example.backend.service.UserService;
import org.example.backend.service.VetService;
import org.example.backend.service.VetClinicMembershipService;
import org.example.backend.service.VeterinaryClinicService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/clinics")
@RequiredArgsConstructor
public class ClinicController {

    private final VeterinaryClinicService service;
    private final UserService userService;
    private final VetService vetService;
    private final VetClinicMembershipService vetClinicMembershipService;

    @GetMapping("/{id}")
    public ResponseEntity<VeterinaryClinicDTO> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getClinic(id));
    }

    /**
     * GET /clinics  (optionally ?city=&speciality=&search=)
     */
    @GetMapping
    public ResponseEntity<List<VeterinaryClinicDTO>> list(@RequestParam(required = false) String city, @RequestParam(required = false) String speciality, @RequestParam(required = false) String search) {

        List<VeterinaryClinicDTO> clinics;
        if (city == null && speciality == null && search == null) {
            clinics = service.getAll();
        } else {
            clinics = service.search(city, speciality);
        }
        return ResponseEntity.ok(clinics);
    }

    @GetMapping("/near")
    public List<VeterinaryClinicDTO> near(@RequestParam double lat, @RequestParam double lng, @RequestParam(defaultValue = "5") double radiusKm) {
        return service.getWithinRadius(lat, lng, radiusKm);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated() and @clinicAccountService.hasClinicAccess(authentication.name, #id)")
    public ResponseEntity<VeterinaryClinicDTO> update(@PathVariable UUID id, @RequestBody VeterinaryClinicDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated() and @clinicAccountService.hasClinicAccess(authentication.name, #id)")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/mine")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<VeterinaryClinicDTO> createMyClinic(@RequestBody @Valid VeterinaryClinicDTO clinicData, @AuthenticationPrincipal UserDetails userDetails) {

        UUID ownerId = UUID.fromString(userDetails.getUsername());
        VeterinaryClinicDTO createdClinic = service.createClinicForOwner(clinicData, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdClinic);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('OWNER')")
    public List<VeterinaryClinicDTO> myClinics(@AuthenticationPrincipal UserDetails userDetails) {
        UUID ownerId = UUID.fromString(userDetails.getUsername());
        return service.getClinicsByOwner(ownerId);
    }

    @GetMapping("/vet")
    @PreAuthorize("hasRole('VET')")
    public List<VeterinaryClinicDTO> getClinicsForVet(@AuthenticationPrincipal UserDetails userDetails) {
        UUID vetId = UUID.fromString(userDetails.getUsername());
        List<UUID> clinicIds = vetClinicMembershipService.clinicsForVet(vetId);
        return clinicIds.stream().map(clinicId -> service.getClinic(clinicId)).collect(Collectors.toList());
    }
}