package org.example.backend.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.data.ActivityLog;
import org.example.backend.data.Appointment;
import org.example.backend.data.User;
import org.example.backend.data.Vet;
import org.example.backend.data.VeterinaryClinic;
import org.example.backend.repository.ActivityLogRepository;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.VetRepository;
import org.example.backend.repository.VeterinaryClinicRepository;
import org.example.backend.service.ActivityLogService;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityLogServiceImpl implements ActivityLogService {
    private final ActivityLogRepository logRepo;
    private final UserRepository userRepo;
    private final VetRepository vetRepo;
    private final VeterinaryClinicRepository clinicRepo;
    private final AppointmentRepository appointmentRepo;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void logActivity(UUID userId, UUID clinicId, UUID vetId, String action, String details, UUID appointmentId, String extraJson) {
        User user = userId != null ? userRepo.findById(userId).orElse(null) : null;
        Vet vet = vetId != null ? vetRepo.findById(vetId).orElse(null) : null;
        VeterinaryClinic clinic = clinicId != null ? clinicRepo.findById(clinicId).orElse(null) : null;
        Appointment appointment = appointmentId != null ? appointmentRepo.findById(appointmentId).orElse(null) : null;
        ActivityLog log = ActivityLog.builder()
                .timestamp(OffsetDateTime.now())
                .user(user)
                .clinic(clinic)
                .vet(vet)
                .action(action)
                .details(details)
                .appointment(appointment)
                .extra(extraJson)
                .build();
        logRepo.save(log);
    }

    @Override
    public List<Object[]> rankClinicsByAppointments() {
        return entityManager.createQuery(
                "SELECT a.clinic.id, COUNT(a.id) as total FROM Appointment a GROUP BY a.clinic.id ORDER BY total DESC"
        ).getResultList();
    }

    @Override
    public List<Object[]> topDoctorsByClinic(UUID clinicId) {
        return entityManager.createQuery(
                "SELECT a.vet.id, COUNT(a.id) as total FROM Appointment a WHERE a.clinic.id = :clinicId GROUP BY a.vet.id ORDER BY total DESC"
        ).setParameter("clinicId", clinicId).getResultList();
    }

    @Override
    public Object[] topPerformingDoctor() {
        List<Object[]> result = entityManager.createQuery(
                "SELECT a.vet.id, COUNT(a.id) as total FROM Appointment a GROUP BY a.vet.id ORDER BY total DESC"
        ).setMaxResults(1).getResultList();
        return result.isEmpty() ? null : result.get(0);
    }
} 