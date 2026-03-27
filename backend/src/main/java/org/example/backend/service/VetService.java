package org.example.backend.service;

import org.example.backend.dto.VetDTO;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface VetService {

    VetDTO getVet(UUID id);

    List<VetDTO> getByClinic(UUID clinicId);

    VetDTO create(VetDTO dto);

    VetDTO update(UUID id, VetDTO dto);

    void delete(UUID id);

    boolean canDeleteVet(UUID vetId);

    Page<VetDTO> search(String query, UUID excludeClinicId, int limit);

}
