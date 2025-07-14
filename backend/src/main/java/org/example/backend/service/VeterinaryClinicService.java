package org.example.backend.service;

import org.example.backend.dto.CreateClinicRequestDTO;
import org.example.backend.dto.VeterinaryClinicDTO;

import java.util.List;
import java.util.UUID;

public interface VeterinaryClinicService {
    VeterinaryClinicDTO getClinic(UUID id);

    List<VeterinaryClinicDTO> getAll();

    List<VeterinaryClinicDTO> search(String city, String speciality);

    List<VeterinaryClinicDTO> getWithinRadius(double lat, double lng, double radiusKm);

    VeterinaryClinicDTO create(VeterinaryClinicDTO dto); // Creates clinic basic info

    VeterinaryClinicDTO update(UUID id, VeterinaryClinicDTO dto);

    void delete(UUID id);

    List<VeterinaryClinicDTO> getClinicsByOwner(UUID ownerId); // Gets clinics based on ClinicAccount link

    VeterinaryClinicDTO createClinicWithOwner(CreateClinicRequestDTO request); // Keep if needed for admin/other flows

    VeterinaryClinicDTO createClinicForOwner(VeterinaryClinicDTO clinicData, UUID ownerId);
}