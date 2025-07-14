package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.data.AppointmentLock;
import org.example.backend.dto.AppointmentLockDTO;
import org.example.backend.dto.CreateAppointmentLockRequestDTO;
import org.example.backend.service.AppointmentLockService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/appointment-locks")
@RequiredArgsConstructor
public class AppointmentLockController {

    private final AppointmentLockService lockService;

    @PostMapping
    public ResponseEntity<AppointmentLockDTO> createLock(
            @RequestBody CreateAppointmentLockRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        AppointmentLock lock = lockService.createLock(request.vetId(), request.appointmentTime(), userId, request.durationMinutes());
        AppointmentLockDTO dto = new AppointmentLockDTO(
                lock.getId(),
                lock.getVet().getId(),
                lock.getUserId(),
                lock.getAppointmentTime(),
                lock.getExpiresAt(),
                lock.getDurationMinutes()
        );
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{lockId}")
    public ResponseEntity<Void> releaseLock(
            @PathVariable UUID lockId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        lockService.releaseLock(lockId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<AppointmentLockDTO> getCurrentLock(
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        return lockService.getCurrentLock(userId)
                .map(lock -> ResponseEntity.ok(new AppointmentLockDTO(
                        lock.getId(),
                        lock.getVet().getId(),
                        lock.getUserId(),
                        lock.getAppointmentTime(),
                        lock.getExpiresAt(),
                        lock.getDurationMinutes()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
} 