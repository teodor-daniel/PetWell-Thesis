package org.example.backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.backend.data.*;
import org.example.backend.dto.AppointmentDTO;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.exception.UnauthorizedException;
import org.example.backend.exception.UserNotFoundException;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.repository.PetRepository;
import org.example.backend.repository.VetRepository;
import org.example.backend.repository.VeterinaryClinicRepository;
import org.example.backend.repository.AppointmentLockRepository;
import org.example.backend.service.AppointmentService;
import org.example.backend.service.ClinicAccountService;
import org.example.backend.service.EmailService;
import org.example.backend.service.ActivityLogService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository repo;
    private final PetRepository pets;
    private final VetRepository vets;
    private final VeterinaryClinicRepository clinics;
    private final ClinicAccountService clinicAccountService;
    private final EmailService emailService;
    private final ActivityLogService activityLogService;
    private final AppointmentLockRepository lockRepository;

    @Override
    @Transactional
    public AppointmentDTO book(AppointmentDTO dto, UUID requesterId) {
        AppointmentLock lock = lockRepository.findByVetIdAndAppointmentTime(dto.vetId(), dto.appointmentDate())
                .orElseThrow(() -> new IllegalStateException("You must reserve a time slot before booking."));

        if (!lock.getUserId().equals(requesterId)) {
            throw new SecurityException("This time slot is reserved by another user.");
        }
        if (lock.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new IllegalStateException("Your reservation has expired. Please select the time slot again.");
        }

        try {
            Pet pet = pets.findById(dto.petId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pet", dto.petId()));
            Vet vet = vets.findById(dto.vetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vet", dto.vetId()));
            VeterinaryClinic clinic = clinics.findById(dto.clinicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Clinic", dto.clinicId()));

            if (!Boolean.TRUE.equals(vet.isActive())) {
                throw new IllegalStateException("The selected vet is currently inactive.");
            }

            Appointment a = Appointment.builder()
                    .pet(pet)
                    .vet(vet)
                    .clinic(clinic)
                    .appointmentDate(dto.appointmentDate())
                    .status(Appointment.Status.PENDING)
                    .notes(dto.notes())
                    .type(dto.type())
                    .build();

            repo.save(a);
            lockRepository.delete(lock);

            return toDto(a);
        } catch (DataIntegrityViolationException ex) {
            if (ex.getCause() instanceof org.hibernate.exception.ConstraintViolationException) {
                throw new DataIntegrityViolationException("This vet already has an appointment at the selected time.");
            }
            throw ex;
        }
    }

    @Override
    @Transactional
    public void cancel(UUID id, UUID requesterId) {
        Appointment a = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));

        boolean isOwner = a.getPet().getOwner().getId().equals(requesterId);
        boolean isVet = a.getVet().getId().equals(requesterId);
        boolean isClinicOwner = clinicAccountService.hasClinicAccess(requesterId, a.getClinic().getId());

        if (!isOwner && !isVet && !isClinicOwner) {
            throw new UserNotFoundException("Not allowed");
        }
        a.setStatus(Appointment.Status.CANCELLED);
        repo.save(a);

        String userEmail = a.getPet().getOwner().getEmail();
        String userName = a.getPet().getOwner().getFullName();
        String vetEmail = a.getVet().getEmail();
        String vetName = a.getVet().getFullName();
        String clinicName = a.getClinic().getName();
        String clinicOwnerEmail = clinicAccountService.getClinicOwnerEmail(a.getClinic().getId());
        String petName = a.getPet().getName();
        String appointmentDate = a.getAppointmentDate().toString();
        java.util.Map<String, Object> model = java.util.Map.of(
                "userName", userName,
                "petName", petName,
                "vetName", vetName,
                "clinicName", clinicName,
                "appointmentDate", appointmentDate
        );

        if (isOwner) {
            emailService.sendTemplateEmail(
                    vetEmail,
                    "Appointment Cancelled",
                    "email/appointment_cancelled.html",
                    model,
                    "APPOINTMENT",
                    a.getId()
            );
            if (clinicOwnerEmail != null) {
                emailService.sendTemplateEmail(
                        clinicOwnerEmail,
                        "Appointment Cancelled",
                        "email/appointment_cancelled.html",
                        model,
                        "APPOINTMENT",
                        a.getId()
                );
            }
        } else {
            emailService.sendTemplateEmail(
                    userEmail,
                    "Appointment Cancelled",
                    "email/appointment_cancelled.html",
                    model,
                    "APPOINTMENT",
                    a.getId()
            );
        }
    }

    @Override
    @Transactional
    public void confirmCancellation(UUID id, UUID requesterId) {
        Appointment a = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));

        if (!a.getVet().getId().equals(requesterId)) {
            throw new UserNotFoundException("Only the assigned vet can confirm cancellation");
        }

        if (a.getStatus() != Appointment.Status.CANCELLED) {
            throw new IllegalStateException("Appointment is not in cancelled state");
        }

    }

    @Override
    @Transactional
    public AppointmentDTO confirm(UUID id, UUID requesterId) {
        Appointment a = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));

        if (!a.getVet().getId().equals(requesterId)) {
            throw new UserNotFoundException("Only the assigned vet can confirm appointments");
        }

        if (a.getStatus() != Appointment.Status.PENDING) {
            throw new IllegalStateException("Appointment is not in pending state");
        }

        a.setStatus(Appointment.Status.CONFIRMED);
        repo.save(a);

        String userEmail = a.getPet().getOwner().getEmail();
        String userName = a.getPet().getOwner().getFullName();
        String petName = a.getPet().getName();
        String vetName = a.getVet().getFullName();
        String clinicName = a.getClinic().getName();
        String appointmentDate = a.getAppointmentDate().toString();
        java.util.Map<String, Object> model = java.util.Map.of(
                "userName", userName,
                "petName", petName,
                "vetName", vetName,
                "clinicName", clinicName,
                "appointmentDate", appointmentDate
        );
        emailService.sendTemplateEmail(
                userEmail,
                "Appointment Confirmed",
                "email/appointment_confirmed.html",
                model,
                "APPOINTMENT",
                a.getId()
        );

        return toDto(a);
    }

    @Override
    public List<AppointmentDTO> vetCalendar(UUID vetId, OffsetDateTime f, OffsetDateTime t) {
        List<AppointmentDTO> confirmed = repo.findByVet_IdAndAppointmentDateBetween(vetId, f, t)
                .stream().map(this::toDto).toList();

        List<AppointmentLock> locks = lockRepository.findAll();
        List<AppointmentDTO> locked = new ArrayList<>();
        OffsetDateTime now = OffsetDateTime.now();
        for (AppointmentLock lock : locks) {
            if (lock.getVet().getId().equals(vetId)
                    && !lock.getExpiresAt().isBefore(now)
                    && !lock.getAppointmentTime().isBefore(f)
                    && !lock.getAppointmentTime().isAfter(t)) {

                locked.add(new AppointmentDTO(
                        null, // id
                        null, // petId
                        null, // petName
                        lock.getVet().getId(),
                        null, // vetName
                        null, // clinicId
                        lock.getAppointmentTime(),
                        "LOCKED", // status
                        "DURATION:" + lock.getDurationMinutes(),
                        null, // petOwnerId
                        null, // petOwnerName
                        null, // petOwnerPhone
                        null  // type
                ));
            }
        }

        List<AppointmentDTO> all = new ArrayList<>();
        all.addAll(confirmed);
        all.addAll(locked);
        return all;
    }

    @Override
    public List<AppointmentDTO> clinicCalendar(UUID clinicId, OffsetDateTime f, OffsetDateTime t) {
        return repo.findByClinic_IdAndAppointmentDateBetween(clinicId, f, t)
                .stream().map(this::toDto).toList();
    }

    @Override
    public List<AppointmentDTO> ownerCalendar(UUID ownerId, OffsetDateTime f, OffsetDateTime t) {
        return repo.findForOwner(ownerId, f, t)
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID requesterId) {
        Appointment appointment = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));

        boolean isOwner = appointment.getPet().getOwner().getId().equals(requesterId);
        boolean isAssignedVet = appointment.getVet().getId().equals(requesterId);
        boolean isClinicVet = appointment.getClinic().getMemberships().stream()
                .anyMatch(m -> m.getVet().getId().equals(requesterId));
        boolean isClinicOwner = clinicAccountService.hasClinicAccess(requesterId, appointment.getClinic().getId());

        if (!isOwner && !isAssignedVet && !isClinicVet && !isClinicOwner) {
            System.out.println("DEBUG: Delete denied. isOwner=" + isOwner + ", isAssignedVet=" + isAssignedVet + ", isClinicVet=" + isClinicVet + ", isClinicOwner=" + isClinicOwner);
            throw new UnauthorizedException("You don't have permission to delete this appointment");
        }

        if (appointment.getStatus() == Appointment.Status.CONFIRMED) {
            throw new IllegalStateException("Cannot delete confirmed appointments");
        }

        String vetEmail = appointment.getVet().getEmail();
        String vetName = appointment.getVet().getFullName();
        String petName = appointment.getPet().getName();
        String clinicName = appointment.getClinic().getName();
        String appointmentDate = appointment.getAppointmentDate().toString();
        java.util.Map<String, Object> model = java.util.Map.of(
                "vetName", vetName,
                "petName", petName,
                "clinicName", clinicName,
                "appointmentDate", appointmentDate
        );
        emailService.sendTemplateEmail(
                vetEmail,
                "Appointment Cancelled",
                "email/appointment_cancelled.html",
                model,
                "APPOINTMENT",
                appointment.getId()
        );

        repo.delete(appointment);
    }

    @Override
    @Transactional
    public AppointmentDTO update(UUID id, AppointmentDTO dto, UUID requesterId) {

        Appointment a = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", id));

        boolean isOwner = a.getPet().getOwner().getId().equals(requesterId);
        boolean isAssignedVet = a.getVet().getId().equals(requesterId);
        boolean isClinicVet = a.getClinic().getMemberships().stream()
                .map(VetClinicMembership::getVet)
                .anyMatch(v -> v.getId().equals(requesterId));
        boolean isClinicOwner = clinicAccountService.hasClinicAccess(requesterId,
                a.getClinic().getId());

        if (!(isOwner || isAssignedVet || isClinicVet || isClinicOwner)) {
            throw new UnauthorizedException("You don't have permission to edit this appointment");
        }

        if (dto.appointmentDate() != null) a.setAppointmentDate(dto.appointmentDate());
        if (dto.notes() != null) a.setNotes(dto.notes());
        if (dto.type() != null) a.setType(dto.type());

        if (dto.vetId() != null && !dto.vetId().equals(a.getVet().getId())) {
            Vet newVet = vets.findById(dto.vetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vet", dto.vetId()));
            boolean isVetInClinic = a.getClinic().getMemberships().stream()
                    .anyMatch(m -> m.getVet().getId().equals(dto.vetId()));
            if (!isVetInClinic) {
                throw new IllegalStateException("Selected vet does not belong to this clinic.");
            }
            if (!Boolean.TRUE.equals(newVet.isActive())) {
                throw new IllegalStateException("The selected vet is currently inactive.");
            }
            a.setVet(newVet);
            String vetEmail = newVet.getEmail();
            String vetName = newVet.getFullName();
            String petName = a.getPet().getName();
            String clinicName = a.getClinic().getName();
            String appointmentDate = a.getAppointmentDate().toString();
            java.util.Map<String, Object> model = java.util.Map.of(
                    "vetName", vetName,
                    "petName", petName,
                    "clinicName", clinicName,
                    "appointmentDate", appointmentDate
            );
            emailService.sendTemplateEmail(
                    vetEmail,
                    "You have been assigned a new appointment",
                    "email/appointment_confirmed.html",
                    model,
                    "APPOINTMENT",
                    a.getId()
            );
        }

        Appointment.Status oldStatus = a.getStatus();
        Appointment.Status newStatus = oldStatus;
        if (dto.status() != null) {
            try {
                newStatus = Appointment.Status.valueOf(dto.status().toUpperCase());
                a.setStatus(newStatus);
            } catch (IllegalArgumentException ex) {
                throw new IllegalStateException("Invalid status: " + dto.status());
            }
        }

        repo.save(a);
        if (dto.status() != null && newStatus != oldStatus) {
            if (newStatus == Appointment.Status.CONFIRMED) {
                String userEmail = a.getPet().getOwner().getEmail();
                String userName = a.getPet().getOwner().getFullName();
                String petName = a.getPet().getName();
                String vetName = a.getVet().getFullName();
                String clinicName = a.getClinic().getName();
                String appointmentDate = a.getAppointmentDate().toString();
                java.util.Map<String, Object> model = java.util.Map.of(
                        "userName", userName,
                        "petName", petName,
                        "vetName", vetName,
                        "clinicName", clinicName,
                        "appointmentDate", appointmentDate
                );
                emailService.sendTemplateEmail(
                        userEmail,
                        "Appointment Confirmed",
                        "email/appointment_confirmed.html",
                        model,
                        "APPOINTMENT",
                        a.getId()
                );
            } else if (newStatus == Appointment.Status.CANCELLED) {
                String vetEmail = a.getVet().getEmail();
                String vetName = a.getVet().getFullName();
                String petName = a.getPet().getName();
                String clinicName = a.getClinic().getName();
                String appointmentDate = a.getAppointmentDate().toString();
                java.util.Map<String, Object> model = java.util.Map.of(
                        "vetName", vetName,
                        "petName", petName,
                        "clinicName", clinicName,
                        "appointmentDate", appointmentDate
                );
                emailService.sendTemplateEmail(
                        vetEmail,
                        "Appointment Cancelled",
                        "email/appointment_cancelled.html",
                        model,
                        "APPOINTMENT",
                        a.getId()
                );
            }
        }

        return toDto(a);
    }

    @Override
    public org.springframework.data.domain.Page<AppointmentDTO> clinicPastAppointments(UUID clinicId,
                                                                                       OffsetDateTime from,
                                                                                       OffsetDateTime to,
                                                                                       String petName,
                                                                                       String petOwnerName,
                                                                                       org.springframework.data.domain.Pageable pageable) {
        return repo.searchPastAppointments(clinicId, from, to, petName, petOwnerName, pageable)
                .map(this::toDto);
    }

    @Override
    public org.springframework.data.domain.Page<AppointmentDTO> ownerPastAppointments(UUID ownerId,
                                                                                      String petName,
                                                                                      String petOwnerName,
                                                                                      org.springframework.data.domain.Pageable pageable) {
        return repo.searchPastAppointmentsByOwner(ownerId, petName, petOwnerName, pageable)
                .map(this::toDto);
    }

    @Override
    public org.springframework.data.domain.Page<AppointmentDTO> vetPastAppointments(UUID vetId, String petName, String petOwnerName, org.springframework.data.domain.Pageable pageable) {
        return repo.searchPastAppointmentsByVet(vetId, petName, petOwnerName, pageable)
                .map(this::toDto);
    }

    @Override
    public List<Pet> findDistinctConfirmedPetsByClinicId(UUID clinicId) {
        return repo.findDistinctConfirmedPetsByClinicId(clinicId);
    }

    @Override
    public void logAppointmentActivity(UUID userId, UUID clinicId, UUID vetId, String action, String details, UUID appointmentId, String extraJson) {
        activityLogService.logActivity(userId, clinicId, vetId, action, details, appointmentId, extraJson);
    }

    /* mapper */
    private AppointmentDTO toDto(Appointment a) {
        return new AppointmentDTO(
                a.getId(),
                a.getPet().getId(),
                a.getPet().getName(),
                a.getVet().getId(),
                a.getVet().getFullName(),
                a.getClinic().getId(),
                a.getAppointmentDate(),
                a.getStatus().name(),
                a.getNotes(),
                a.getPet().getOwner() != null ? a.getPet().getOwner().getId() : null,
                a.getPet().getOwner() != null ? a.getPet().getOwner().getFullName() : null,
                a.getPet().getOwner() != null ? a.getPet().getOwner().getPhone() : null,
                a.getType()
        );
    }
}
