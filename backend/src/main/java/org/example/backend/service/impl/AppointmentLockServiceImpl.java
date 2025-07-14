package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.data.AppointmentLock;
import org.example.backend.data.Vet;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.AppointmentLockRepository;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.repository.VetRepository;
import org.example.backend.service.AppointmentLockService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentLockServiceImpl implements AppointmentLockService {

    private static final int LOCK_DURATION_MINUTES = 5;

    private final AppointmentLockRepository lockRepository;
    private final AppointmentRepository appointmentRepository;
    private final VetRepository vetRepository;

    @Override
    @Transactional
    public AppointmentLock createLock(UUID vetId, OffsetDateTime appointmentTime, UUID userId, int durationMinutes) {

        appointmentRepository.findByVet_IdAndAppointmentDate(vetId, appointmentTime).ifPresent(a -> {
            throw new DataIntegrityViolationException("This time slot is already booked.");
        });

        Optional<AppointmentLock> existingLock = lockRepository.findByVetIdAndAppointmentTime(vetId, appointmentTime);
        if (existingLock.isPresent() && existingLock.get().getExpiresAt().isAfter(OffsetDateTime.now())) {
            throw new DataIntegrityViolationException("This time slot is temporarily reserved by another user.");
        }

        existingLock.ifPresent(lockRepository::delete);
        lockRepository.findByUserId(userId).ifPresent(lockRepository::delete);

        Vet vet = vetRepository.findById(vetId)
                .orElseThrow(() -> new ResourceNotFoundException("Vet", vetId));

        AppointmentLock newLock = AppointmentLock.builder()
                .vet(vet)
                .userId(userId)
                .appointmentTime(appointmentTime)
                .expiresAt(OffsetDateTime.now().plusMinutes(LOCK_DURATION_MINUTES))
                .durationMinutes(durationMinutes)
                .build();

        return lockRepository.save(newLock);
    }

    @Override
    @Transactional
    public void releaseLock(UUID lockId, UUID userId) {
        lockRepository.findById(lockId).ifPresent(lock -> {
            if (!lock.getUserId().equals(userId)) {
                throw new SecurityException("You do not have permission to release this lock.");
            }
            lockRepository.delete(lock);
        });
    }

    @Override
    public Optional<AppointmentLock> getCurrentLock(UUID userId) {
        return lockRepository.findByUserId(userId);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredLocks() {
        lockRepository.deleteAllByExpiresAtBefore(OffsetDateTime.now());
    }
} 