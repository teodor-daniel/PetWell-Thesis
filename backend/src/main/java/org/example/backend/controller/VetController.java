package org.example.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.VetDTO;
import org.example.backend.service.VetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.example.backend.validation.VetValidation;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/vets")
@RequiredArgsConstructor
public class VetController {

    private final VetService service;
    private final VetValidation vetValidation;

    @GetMapping("/{id}")
    public ResponseEntity<VetDTO> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getVet(id));
    }

    @GetMapping("/by-clinic/{clinicId}")
    public List<VetDTO> byClinic(@PathVariable UUID clinicId) {
        return service.getByClinic(clinicId);
    }

    @PostMapping
    public ResponseEntity<VetDTO> create(@RequestBody VetDTO dto) {
        if (vetValidation.isNotValid(dto)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VetDTO> update(@PathVariable UUID id, @RequestBody VetDTO dto) {
        if (vetValidation.isNotValidForUpdate(dto)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("#id.toString() == authentication.name or hasRole('ADMIN')")
    public ResponseEntity<String> delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        System.out.println("DELETE /vets/" + id + " called");

        boolean canDelete = service.canDeleteVet(id);
        System.out.println("canDeleteVet result: " + canDelete);

        if (!canDelete) {
            VetDTO vet = service.getVet(id);
            System.out.println("Vet clinicId: " + vet.clinicId());

            if (vet.clinicId() != null) {
                System.out.println("Returning 409 - linked to clinic");
                return ResponseEntity.status(409).body("Cannot delete account: You are still linked to a clinic. Please leave the clinic first.");
            } else {
                System.out.println("Returning 409 - pending appointments");
                return ResponseEntity.status(409).body("Cannot delete account: You have pending or accepted bookings.");
            }
        }

        System.out.println("Proceeding with deletion");
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public List<VetDTO> search(@RequestParam String query, @RequestParam(required = false) UUID excludeClinicId, @RequestParam(defaultValue = "20") int limit) {
        return service.search(query, excludeClinicId, limit).getContent();
    }

    @PostMapping("/register")
    public ResponseEntity<VetDTO> register(@Valid @RequestBody VetDTO dto) {
        if (vetValidation.isNotValid(dto)) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.create(dto));
    }

}
