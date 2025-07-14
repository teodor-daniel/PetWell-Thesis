package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.MedicalRecordDTO;
import org.example.backend.service.MedicalRecordService;
import org.example.backend.service.UserService;
import org.example.backend.service.VetService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/medical-record")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;
    private final UserService userService;
    private final VetService vetService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MedicalRecordDTO> uploadMedicalRecord(@RequestParam("file") MultipartFile file, @RequestParam("petId") UUID petId, @RequestParam(value = "isClinic", defaultValue = "false") boolean isClinic, @RequestParam(value = "clinicId", required = false) UUID clinicId, @RequestParam(value = "vetId", required = false) UUID vetId, @RequestParam(value = "uploaderId", required = false) UUID uploaderId, Authentication authentication) {

        UUID finalUploaderId;
        if (isClinic) {
            finalUploaderId = uploaderId;
        } else {
            finalUploaderId = UUID.fromString(authentication.getName());
        }

        MedicalRecordDTO record = medicalRecordService.uploadMedicalRecord(petId, finalUploaderId, file, isClinic, clinicId, vetId);
        return ResponseEntity.ok(record);
    }

    @GetMapping("/pet/{petId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MedicalRecordDTO>> getRecordsForPet(@PathVariable UUID petId, @RequestParam(value = "isClinic", defaultValue = "false") boolean isClinic, @RequestParam(value = "clinicId", required = false) UUID clinicId, @RequestParam(value = "vetId", required = false) UUID vetId, Authentication authentication) {
        UUID requesterId = isClinic ? null : UUID.fromString(authentication.getName());
        List<MedicalRecordDTO> records = medicalRecordService.getRecordsForPet(petId, requesterId, isClinic, clinicId, vetId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/download/{recordId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> downloadMedicalRecord(@PathVariable UUID recordId, @RequestParam(value = "isClinic", defaultValue = "false") boolean isClinic, @RequestParam(value = "clinicId", required = false) UUID clinicId, @RequestParam(value = "vetId", required = false) UUID vetId, Authentication authentication) {
        UUID requesterId = isClinic ? null : UUID.fromString(authentication.getName());
        String url = medicalRecordService.generateDownloadUrl(recordId, requesterId, isClinic, clinicId, vetId);
        return ResponseEntity.ok(url);
    }

    @DeleteMapping("/{recordId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteMedicalRecord(@PathVariable UUID recordId, @RequestParam(value = "isClinic", defaultValue = "false") boolean isClinic, @RequestParam(value = "clinicId", required = false) UUID clinicId, @RequestParam(value = "vetId", required = false) UUID vetId, Authentication authentication) {
        UUID requesterId = isClinic ? null : UUID.fromString(authentication.getName());
        medicalRecordService.deleteMedicalRecord(recordId, requesterId, isClinic, clinicId, vetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/clinic/{clinicId}/confirmed-appointments")
    @PreAuthorize("@clinicAccountService.hasClinicAccess(authentication.name, #clinicId) or hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecordDTO>> getMedicalRecordsForConfirmedAppointments(@PathVariable UUID clinicId, @RequestParam(required = false) String petName, @RequestParam(required = false) String uploaderName, @RequestParam(required = false) String fileName, @RequestParam(required = false) String dateFrom, @RequestParam(required = false) String dateTo, Authentication authentication) {
        List<MedicalRecordDTO> records = medicalRecordService.getMedicalRecordsForConfirmedAppointments(clinicId, petName, uploaderName, fileName, dateFrom, dateTo);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/clinic/{clinicId}/all")
    @PreAuthorize("@clinicAccountService.hasClinicAccess(authentication.name, #clinicId) or hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecordDTO>> getAllMedicalRecordsForClinic(@PathVariable UUID clinicId, @RequestParam(required = false) String petName, @RequestParam(required = false) String uploaderName, @RequestParam(required = false) String fileName, @RequestParam(required = false) String dateFrom, @RequestParam(required = false) String dateTo, Authentication authentication) {
        List<MedicalRecordDTO> records = medicalRecordService.getAllMedicalRecordsForClinic(clinicId, petName, uploaderName, fileName, dateFrom, dateTo);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("authentication.name == #userId.toString() or hasRole('ADMIN')")
    public ResponseEntity<List<MedicalRecordDTO>> getMedicalRecordsForUser(@PathVariable UUID userId, Authentication authentication) {
        List<MedicalRecordDTO> records = medicalRecordService.getMedicalRecordsForUser(userId);
        return ResponseEntity.ok(records);
    }
} 