package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.data.*;
import org.example.backend.dto.MedicalRecordDTO;
import org.example.backend.googleApi.CloudStorageService;
import org.example.backend.repository.*;
import org.example.backend.service.AppointmentService;
import org.example.backend.service.EmailService;
import org.example.backend.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {
    private final MedicalRecordRepository recordRepo;
    private final PetRepository petRepo;
    private final UserRepository userRepo;
    private final VetRepository vetRepo;
    private final VeterinaryClinicRepository clinicRepo;
    private final CloudStorageService cloudStorageService;
    private final AppointmentService appointmentService;
    private final EmailService emailService;

    @Value("${bucket-value}")
    private String bucket;

    private static MedicalRecordDTO toDto(MedicalRecord record) {
        return new MedicalRecordDTO(
                record.getId(),
                record.getPet() != null ? record.getPet().getId() : null,
                record.getPet() != null ? record.getPet().getName() : null,
                record.getFileName(),
                record.getGcsPath(),
                record.getCreatedAt(),
                record.getUploaderUser() != null ? record.getUploaderUser().getId() : null,
                record.getUploaderUser() != null ? record.getUploaderUser().getFullName() : null,
                record.getVet() != null ? record.getVet().getId() : null,
                record.getVet() != null ? record.getVet().getFullName() : null,
                record.getClinic() != null ? record.getClinic().getId() : null,
                record.getClinic() != null ? record.getClinic().getName() : null
        );
    }

    @Override
    public MedicalRecordDTO uploadMedicalRecord(UUID petId, UUID uploaderId, MultipartFile file, boolean isClinic, UUID clinicId, UUID vetId) {
        Pet pet = petRepo.findById(petId).orElseThrow(() -> new IllegalArgumentException("Pet not found"));
        String petName = pet.getName();
        String fileName = file.getOriginalFilename();
        String gcsPath;
        User uploaderUser = null;
        Vet vet = null;
        VeterinaryClinic clinic = null;
        User petOwner = pet.getOwner();

        if (isClinic) {
            clinic = clinicRepo.findById(clinicId).orElseThrow(() -> new IllegalArgumentException("Clinic not found"));
            if (vetId != null) {
                vet = vetRepo.findById(vetId).orElse(null);
            } else {
                if (uploaderId != null) {
                    uploaderUser = userRepo.findById(uploaderId).orElse(null);
                }
            }
            gcsPath = "clinic-" + clinicId + "/pets/" + petName + "/records/" + fileName;
        } else {
            uploaderUser = userRepo.findById(uploaderId).orElseThrow(() -> new IllegalArgumentException("User not found"));
            gcsPath = uploaderUser.getEmail() + "/pets/" + petName + "/records/" + fileName;
        }

        try {
            cloudStorageService.createFolderIfMissing(bucket, gcsPath.substring(0, gcsPath.lastIndexOf('/')));
            cloudStorageService.uploadObjectFromMemory(bucket, gcsPath, file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file to GCS", e);
        }

        MedicalRecord record = MedicalRecord.builder()
                .pet(pet)
                .vet(vet)
                .clinic(clinic)
                .uploaderUser(uploaderUser)
                .fileName(fileName)
                .gcsPath(gcsPath)
                .createdAt(java.time.OffsetDateTime.now())
                .build();

        MedicalRecord savedRecord = recordRepo.save(record);

        if (isClinic && petOwner != null) {
            try {
                String ownerGcsPath = petOwner.getEmail() + "/pets/" + petName + "/records/" + fileName;

                cloudStorageService.createFolderIfMissing(bucket, ownerGcsPath.substring(0, ownerGcsPath.lastIndexOf('/')));
                cloudStorageService.copyObject(bucket, gcsPath, bucket, ownerGcsPath);

                MedicalRecord sharedRecord = MedicalRecord.builder()
                        .pet(pet)
                        .vet(vet)
                        .clinic(clinic)
                        .uploaderUser(uploaderUser)
                        .fileName(fileName)
                        .gcsPath(ownerGcsPath)
                        .createdAt(java.time.OffsetDateTime.now())
                        .build();

                recordRepo.save(sharedRecord);

            } catch (Exception e) {
                System.err.println("Failed to create shared copy for pet owner: " + e.getMessage());
            }
        }

        if (isClinic && petOwner != null) {
            try {
                String uploaderName = vet != null ? vet.getFullName() :
                        (uploaderUser != null ? uploaderUser.getFullName() : "Veterinary Staff");
                String clinicName = clinic != null ? clinic.getName() : "Veterinary Clinic";

                java.util.Map<String, Object> model = java.util.Map.of(
                        "userName", petOwner.getFullName(),
                        "petName", petName,
                        "fileName", fileName,
                        "uploaderName", uploaderName,
                        "clinicName", clinicName,
                        "uploadDate", java.time.OffsetDateTime.now().toString()
                );

                emailService.sendTemplateEmail(
                        petOwner.getEmail(),
                        "New Medical Record Available for " + petName,
                        "email/medical_record_uploaded.html",
                        model,
                        "MEDICAL_RECORD",
                        savedRecord.getId()
                );
            } catch (Exception e) {
                System.err.println("Failed to send email notification: " + e.getMessage());
            }
        }

        return toDto(savedRecord);
    }

    @Override
    public List<MedicalRecordDTO> getRecordsForPet(UUID petId, UUID requesterId, boolean isClinic, UUID clinicId, UUID vetId) {
        return recordRepo.findByPet_Id(petId).stream().map(MedicalRecordServiceImpl::toDto).toList();
    }

    @Override
    public String generateDownloadUrl(UUID recordId, UUID requesterId, boolean isClinic, UUID clinicId, UUID vetId) {
        MedicalRecord record = recordRepo.findById(recordId).orElseThrow(() -> new IllegalArgumentException("Record not found"));
        return cloudStorageService.generateSignedUrl(bucket, record.getGcsPath(), 60);
    }

    @Override
    public void deleteMedicalRecord(UUID recordId, UUID requesterId, boolean isClinic, UUID clinicId, UUID vetId) {
        MedicalRecord record = recordRepo.findById(recordId).orElseThrow(() -> new IllegalArgumentException("Record not found"));
        if (record.getGcsPath() != null) {
            try {
                cloudStorageService.deleteObject(bucket, record.getGcsPath());
            } catch (Exception e) {
                System.err.println("Failed to delete file from GCS: " + record.getGcsPath() + ", Error: " + e.getMessage());
            }
        }

        recordRepo.delete(record);
    }

    @Override
    public List<MedicalRecordDTO> getMedicalRecordsForConfirmedAppointments(UUID clinicId) {
        List<Pet> confirmedPets = appointmentService.findDistinctConfirmedPetsByClinicId(clinicId);

        return confirmedPets.stream()
                .flatMap(pet -> recordRepo.findByPet_Id(pet.getId()).stream())
                .map(MedicalRecordServiceImpl::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalRecordDTO> getAllMedicalRecordsForClinic(UUID clinicId) {
        return recordRepo.findByClinic_Id(clinicId).stream()
                .map(MedicalRecordServiceImpl::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalRecordDTO> getMedicalRecordsForConfirmedAppointments(UUID clinicId, String petName, String uploaderName, String fileName, String dateFrom, String dateTo) {
        List<Pet> confirmedPets = appointmentService.findDistinctConfirmedPetsByClinicId(clinicId);

        List<MedicalRecordDTO> records = confirmedPets.stream()
                .flatMap(pet -> recordRepo.findByPet_Id(pet.getId()).stream())
                .map(MedicalRecordServiceImpl::toDto)
                .collect(Collectors.toList());

        return applyFilters(records, petName, uploaderName, fileName, dateFrom, dateTo);
    }

    @Override
    public List<MedicalRecordDTO> getAllMedicalRecordsForClinic(UUID clinicId, String petName, String uploaderName, String fileName, String dateFrom, String dateTo) {
        List<MedicalRecordDTO> records = recordRepo.findByClinic_Id(clinicId).stream()
                .map(MedicalRecordServiceImpl::toDto)
                .collect(Collectors.toList());

        return applyFilters(records, petName, uploaderName, fileName, dateFrom, dateTo);
    }

    private List<MedicalRecordDTO> applyFilters(List<MedicalRecordDTO> records, String petName, String uploaderName, String fileName, String dateFrom, String dateTo) {
        return records.stream()
                .filter(record -> petName == null || petName.isEmpty() ||
                        (record.petName() != null && record.petName().toLowerCase().contains(petName.toLowerCase())))
                .filter(record -> uploaderName == null || uploaderName.isEmpty() ||
                        (record.uploaderUserName() != null && record.uploaderUserName().toLowerCase().contains(uploaderName.toLowerCase())) ||
                        (record.vetName() != null && record.vetName().toLowerCase().contains(uploaderName.toLowerCase())))
                .filter(record -> fileName == null || fileName.isEmpty() ||
                        (record.fileName() != null && record.fileName().toLowerCase().contains(fileName.toLowerCase())))
                .filter(record -> dateFrom == null || dateFrom.isEmpty() ||
                        (record.createdAt() != null && record.createdAt().toInstant().isAfter(java.time.Instant.parse(dateFrom))))
                .filter(record -> dateTo == null || dateTo.isEmpty() ||
                        (record.createdAt() != null && record.createdAt().toInstant().isBefore(java.time.Instant.parse(dateTo))))
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalRecordDTO> getMedicalRecordsForUser(UUID userId) {
        List<Pet> userPets = petRepo.findByOwnerId(userId);

        return userPets.stream()
                .flatMap(pet -> recordRepo.findByPet_Id(pet.getId()).stream())
                .map(MedicalRecordServiceImpl::toDto)
                .collect(Collectors.toList());
    }
} 