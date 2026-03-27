package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.service.ActivityLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final ActivityLogService analytics;

    @GetMapping("/clinics/rank-by-appointments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> rankClinicsByAppointments() {
        return ResponseEntity.ok(analytics.rankClinicsByAppointments());
    }

    @GetMapping("/clinics/{clinicId}/top-doctors")
    @PreAuthorize("@clinicAccountService.hasClinicAccess(authentication.name, #clinicId) or hasRole('ADMIN')")
    public ResponseEntity<List<Object[]>> topDoctorsByClinic(@PathVariable UUID clinicId) {
        return ResponseEntity.ok(analytics.topDoctorsByClinic(clinicId));
    }

    @GetMapping("/top-doctor")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object[]> topPerformingDoctor() {
        return ResponseEntity.ok(analytics.topPerformingDoctor());
    }
} 