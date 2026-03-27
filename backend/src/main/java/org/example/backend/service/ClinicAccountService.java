package org.example.backend.service;

import org.example.backend.dto.ClinicAccountDTO;

import java.util.List;
import java.util.UUID;

public interface ClinicAccountService {
    ClinicAccountDTO createClinicAccount(UUID clinicId, UUID userId, String staffRole);

    List<ClinicAccountDTO> getClinicAccountsByUserId(UUID userId);

    List<ClinicAccountDTO> getClinicAccountsByClinicId(UUID clinicId);

    void deleteClinicAccount(UUID clinicId, UUID userId);

    void updateStaffRole(UUID clinicId, UUID userId, String newRole);

    boolean hasClinicAccess(UUID userId, UUID clinicId);

    boolean hasClinicAccess(String identifier, UUID clinicId);

    String getClinicOwnerEmail(UUID clinicId);

} 