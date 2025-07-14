package org.example.backend.service;

import org.example.backend.dto.MedicalRecordDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MedicalRecordService {
    MedicalRecordDTO uploadMedicalRecord(UUID petId, UUID uploaderId, MultipartFile file, boolean isClinic, UUID clinicId, UUID vetId);

    List<MedicalRecordDTO> getRecordsForPet(UUID petId, UUID requesterId, boolean isClinic, UUID clinicId, UUID vetId);

    String generateDownloadUrl(UUID recordId, UUID requesterId, boolean isClinic, UUID clinicId, UUID vetId);

    void deleteMedicalRecord(UUID recordId, UUID requesterId, boolean isClinic, UUID clinicId, UUID vetId);

    List<MedicalRecordDTO> getMedicalRecordsForConfirmedAppointments(UUID clinicId);

    List<MedicalRecordDTO> getAllMedicalRecordsForClinic(UUID clinicId);

    List<MedicalRecordDTO> getMedicalRecordsForConfirmedAppointments(UUID clinicId, String petName, String uploaderName, String fileName, String dateFrom, String dateTo);

    List<MedicalRecordDTO> getAllMedicalRecordsForClinic(UUID clinicId, String petName, String uploaderName, String fileName, String dateFrom, String dateTo);

    List<MedicalRecordDTO> getMedicalRecordsForUser(UUID userId);
} 