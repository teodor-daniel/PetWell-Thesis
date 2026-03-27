/* src/main/java/org/example/backend/service/AppointmentService.java */
package org.example.backend.service;

import org.example.backend.dto.AppointmentDTO;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentService {
    AppointmentDTO book(AppointmentDTO dto, UUID requesterId);

    void delete(UUID id, UUID requesterId);

    void cancel(UUID id, UUID requesterId);

    void confirmCancellation(UUID id, UUID requesterId);

    AppointmentDTO confirm(UUID id, UUID requesterId);

    List<AppointmentDTO> vetCalendar(UUID vetId, OffsetDateTime from, OffsetDateTime to);

    List<AppointmentDTO> clinicCalendar(UUID clinicId, OffsetDateTime from, OffsetDateTime to);

    List<AppointmentDTO> ownerCalendar(UUID ownerId, OffsetDateTime from, OffsetDateTime to);

    AppointmentDTO update(UUID id, AppointmentDTO dto, UUID requesterId);

    org.springframework.data.domain.Page<AppointmentDTO> clinicPastAppointments(UUID clinicId, OffsetDateTime from, OffsetDateTime to, String petName, String petOwnerName, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<AppointmentDTO> ownerPastAppointments(UUID ownerId, String petName, String petOwnerName, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<AppointmentDTO> vetPastAppointments(UUID vetId, String petName, String petOwnerName, org.springframework.data.domain.Pageable pageable);

    List<org.example.backend.data.Pet> findDistinctConfirmedPetsByClinicId(UUID clinicId);

    void logAppointmentActivity(UUID userId, UUID clinicId, UUID vetId, String action, String details, UUID appointmentId, String extraJson);
}
