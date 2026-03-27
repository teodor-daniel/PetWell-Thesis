package org.example.backend.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.example.backend.data.ClinicAccount;

import java.util.UUID;

@Data
@Getter
@Setter
public class ClinicAccountDTO {
    private UUID clinicId;
    private UUID userId;
    private String staffRole;
    private String clinicName;
    private String userName;

    public static ClinicAccountDTO fromEntity(ClinicAccount entity) {
        ClinicAccountDTO dto = new ClinicAccountDTO();
        dto.setClinicId(entity.getClinic().getId());
        dto.setUserId(entity.getUser().getId());
        dto.setStaffRole(entity.getStaffRole().name());
        dto.setClinicName(entity.getClinic().getName());
        dto.setUserName(entity.getUser().getFullName());
        return dto;
    }
} 