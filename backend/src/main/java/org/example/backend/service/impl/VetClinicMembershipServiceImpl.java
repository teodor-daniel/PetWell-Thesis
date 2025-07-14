package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.data.Vet;
import org.example.backend.data.VetClinicMembership;
import org.example.backend.data.VeterinaryClinic;
import org.example.backend.repository.VetClinicMembershipRepository;
import org.example.backend.repository.VetRepository;
import org.example.backend.repository.VeterinaryClinicRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.ClinicAccountService;
import org.example.backend.service.VetClinicMembershipService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VetClinicMembershipServiceImpl implements VetClinicMembershipService {

    private final VetClinicMembershipRepository repo;
    private final VetRepository vetRepo;
    private final VeterinaryClinicRepository clinicRepo;
    private final ClinicAccountService clinicAccountService;
    private final UserRepository userRepository;


    @Override
    @Transactional(readOnly = true)
    public List<UUID> clinicsForVet(UUID vetId) {
        return repo.findByVet_Id(vetId).stream()
                .map(m -> m.getClinic().getId())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UUID> vetsForClinic(UUID clinicId) {
        return repo.findByClinic_Id(clinicId).stream()
                .map(m -> m.getVet().getId())
                .toList();
    }


    @Override
    public void add(UUID vetId, UUID clinicId, VetClinicMembership.Role role) {
        if (repo.existsByVetIdAndClinicId(vetId, clinicId)) return;

        Vet vet = vetRepo.getReferenceById(vetId);
        VeterinaryClinic clinic = clinicRepo.getReferenceById(clinicId);

        VetClinicMembership link = new VetClinicMembership();
        link.setVet(vet);
        link.setClinic(clinic);
        link.setRole(role);

        repo.save(link);
    }

    @Override
    public void remove(UUID vetId, UUID clinicId) {
        repo.deleteByVet_IdAndClinic_Id(vetId, clinicId);
    }

    public boolean isOwner(String userId, UUID clinicId) {
        try {
            UUID uuid = UUID.fromString(userId);
            return clinicAccountService != null &&
                    clinicAccountService.getClinicAccountsByUserId(uuid).stream()
                            .anyMatch(acc -> acc.getClinicId().equals(clinicId) && "OWNER".equals(acc.getStaffRole()));
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @Override
    public boolean isVetForClinic(String vetId, UUID clinicId) {
        try {
            UUID vetUUID = UUID.fromString(vetId);
            return repo.existsByVet_IdAndClinic_Id(vetUUID, clinicId);
        } catch (Exception e) {
            return false;
        }
    }
}
