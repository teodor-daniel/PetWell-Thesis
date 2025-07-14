package org.example.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.backend.dto.AppointmentDTO;
import org.example.backend.service.AppointmentService;
import org.example.backend.service.UserService;
import org.example.backend.service.VetService;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService svc;
    private final UserService userService;
    private final VetService vetService;

    @PostMapping
    public AppointmentDTO book(@Valid @RequestBody AppointmentDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        UUID requesterId = UUID.fromString(userDetails.getUsername());
        return svc.book(dto, requesterId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id, @AuthenticationPrincipal UserDetails user) {
        UUID requesterId = UUID.fromString(user.getUsername());
        svc.delete(id, requesterId);
    }

    @PatchMapping("/{id}/cancel")
    public void cancel(@PathVariable UUID id, @AuthenticationPrincipal UserDetails user) {
        UUID requesterId = UUID.fromString(user.getUsername());
        svc.cancel(id, requesterId);
    }

    @PatchMapping("/{id}/confirm-cancellation")
    public void confirmCancellation(@PathVariable UUID id, @AuthenticationPrincipal UserDetails user) {
        UUID requesterId = UUID.fromString(user.getUsername());
        svc.confirmCancellation(id, requesterId);
    }

    @PatchMapping("/{id}/confirm")
    public AppointmentDTO confirm(@PathVariable UUID id, @AuthenticationPrincipal UserDetails user) {
        UUID requesterId = UUID.fromString(user.getUsername());
        return svc.confirm(id, requesterId);
    }

    @GetMapping("/vet/{vetId}")
    public List<AppointmentDTO> vetCal(@PathVariable UUID vetId, @RequestParam OffsetDateTime from, @RequestParam OffsetDateTime to) {
        return svc.vetCalendar(vetId, from, to);
    }

    @GetMapping("/clinic/{clinicId}")
    public List<AppointmentDTO> clinicCal(@PathVariable UUID clinicId, @RequestParam OffsetDateTime from, @RequestParam OffsetDateTime to) {
        return svc.clinicCalendar(clinicId, from, to);
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("#ownerId.toString() == authentication.name or hasRole('ADMIN')")
    public List<AppointmentDTO> ownerCal(@PathVariable UUID ownerId, @RequestParam OffsetDateTime from, @RequestParam OffsetDateTime to) {
        return svc.ownerCalendar(ownerId, from, to);
    }

    @PatchMapping("/{id}/vet")
    @PreAuthorize("hasAnyRole('VET', 'OWNER')")
    public AppointmentDTO updateByVet(@PathVariable UUID id, @RequestBody AppointmentDTO dto, @AuthenticationPrincipal UserDetails principal) {
        UUID principalId = UUID.fromString(principal.getUsername());
        return svc.update(id, dto, principalId);
    }

    @PatchMapping("/{id}/owner")
    @PreAuthorize("hasAnyRole('USER','OWNER')")
    public AppointmentDTO updateByOwner(@PathVariable UUID id, @RequestBody AppointmentDTO dto, @AuthenticationPrincipal UserDetails principal) {
        UUID ownerId = UUID.fromString(principal.getUsername());
        return svc.update(id, dto, ownerId);
    }


    @GetMapping("/clinic/{clinicId}/past-paged")
    @PreAuthorize("hasAnyRole('VET', 'OWNER')")
    public Page<AppointmentDTO> getPastAppointmentsPaged(@PathVariable UUID clinicId, @RequestParam OffsetDateTime from, @RequestParam OffsetDateTime to, @RequestParam(required = false) String petName, @RequestParam(required = false) String petOwnerName, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return svc.clinicPastAppointments(clinicId, from, to, petName, petOwnerName, pageable);
    }


    @GetMapping("/owner/{ownerId}/past-paged")
    @PreAuthorize("#ownerId.toString() == authentication.name or hasRole('ADMIN')")
    public Page<AppointmentDTO> getPastAppointmentsByOwnerPaged(@PathVariable UUID ownerId, @RequestParam(required = false) String petName, @RequestParam(required = false) String petOwnerName, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return svc.ownerPastAppointments(ownerId, petName, petOwnerName, pageable);
    }


    @GetMapping("/vet/{vetId}/past-paged")
    @PreAuthorize("#vetId.toString() == authentication.name or hasRole('ADMIN')")
    public Page<AppointmentDTO> getPastAppointmentsByVetPaged(@PathVariable UUID vetId, @RequestParam(required = false) String petName, @RequestParam(required = false) String petOwnerName, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return svc.vetPastAppointments(vetId, petName, petOwnerName, pageable);
    }

    @GetMapping("/clinic/{clinicId}/confirmed-pets")
    @PreAuthorize("@clinicAccountService.hasClinicAccess(authentication.name, #clinicId) or hasRole('ADMIN')")
    public List<org.example.backend.dto.PetDTO> getConfirmedPetsForClinic(@PathVariable UUID clinicId) {
        List<org.example.backend.data.Pet> pets = svc.findDistinctConfirmedPetsByClinicId(clinicId);
        return pets.stream().map(org.example.backend.dto.PetDTO::fromEntity).toList();
    }

}
