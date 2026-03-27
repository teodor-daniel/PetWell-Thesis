package org.example.backend.service;

import org.example.backend.data.ActivityLog;

import java.util.List;
import java.util.UUID;

public interface ActivityLogService {
    void logActivity(UUID userId, UUID clinicId, UUID vetId, String action, String details, UUID appointmentId, String extraJson);

    List<Object[]> rankClinicsByAppointments();

    List<Object[]> topDoctorsByClinic(UUID clinicId);

    Object[] topPerformingDoctor();
} 