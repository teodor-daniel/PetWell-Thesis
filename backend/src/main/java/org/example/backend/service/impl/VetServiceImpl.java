package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.data.Vet;
import org.example.backend.data.VetClinicMembership;
import org.example.backend.data.VeterinaryClinic;
import org.example.backend.dto.VetDTO;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.repository.VetClinicMembershipRepository;
import org.example.backend.repository.VetRepository;
import org.example.backend.repository.VeterinaryClinicRepository;
import org.example.backend.service.VetService;
import org.example.backend.validation.VetValidation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VetServiceImpl implements VetService {

    private final VetRepository vetRepo;
    private final VeterinaryClinicRepository clinicRepo;
    private final VetClinicMembershipRepository membershipRepo;
    private final PasswordEncoder passwordEncoder;
    private final AppointmentRepository appointmentRepository;
    private final VetValidation vetValidation;


    @Override
    public VetDTO getVet(UUID id) {
        return toDto(vetRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vet", id)));
    }

    @Override
    public List<VetDTO> getByClinic(UUID clinicId) {
        return vetRepo.findByClinic(clinicId).stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public VetDTO create(VetDTO dto) {

        if (vetValidation.isNotValid(dto)) {
            throw new IllegalArgumentException("Invalid vet data");
        }

        if (vetRepo.existsByEmail(dto.email()))
            throw new IllegalArgumentException("Email already used");

        Vet vet = toEntity(dto);
        vet.setActive(true);
        vetRepo.save(vet);

        if (dto.clinicId() != null) {
            VeterinaryClinic clinic = clinicRepo.findById(dto.clinicId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Clinic", dto.clinicId()));

            VetClinicMembership link = new VetClinicMembership();
            link.setVet(vet);
            link.setClinic(clinic);
            link.setRole(VetClinicMembership.Role.PRIMARY);
            membershipRepo.save(link);
        }

        return toDto(vet);
    }

    @Override
    @Transactional
    public VetDTO update(UUID id, VetDTO dto) {

        if (vetValidation.isNotValidForUpdate(dto)) {
            throw new IllegalArgumentException("Invalid vet data");
        }

        Vet vet = vetRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vet", id));

        vet.setFullName(dto.fullName());
        vet.setEmail(dto.email());
        vet.setPhone(dto.phone());
        vet.setSpecialities(dto.specialities());

        if (dto.clinicId() != null && !membershipRepo.existsByVet_IdAndClinic_Id(id, dto.clinicId())) {
            VeterinaryClinic newClinic = clinicRepo.findById(dto.clinicId())
                    .orElseThrow(() -> new ResourceNotFoundException("Clinic", dto.clinicId()));

            if (!vet.getMemberships().isEmpty()) {
                membershipRepo.deleteByVet_IdAndClinic_Id(id,
                        vet.getMemberships().iterator().next().getClinic().getId());
            }

            VetClinicMembership link = new VetClinicMembership();
            link.setVet(vet);
            link.setClinic(newClinic);
            link.setRole(VetClinicMembership.Role.PRIMARY);
            membershipRepo.save(link);
        }

        return toDto(vetRepo.save(vet));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Vet vet = vetRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vet", id));

        List<VetClinicMembership> memberships = membershipRepo.findByVet_Id(id);
        for (VetClinicMembership membership : memberships) {
            membershipRepo.deleteByVet_IdAndClinic_Id(id, membership.getClinic().getId());
        }

        vetRepo.delete(vet);
    }


    @Override
    public Page<VetDTO> search(String query, UUID excludeClinicId, int limit) {
        Page<Vet> page = vetRepo.searchAvailable(
                query,
                excludeClinicId,
                PageRequest.of(0, limit, Sort.by("fullName"))   // ← PageRequest implements Pageable
        );

        return page.map(this::toDto);
    }

    @Override
    public boolean canDeleteVet(UUID vetId) {
        System.out.println("canDeleteVet called for vetId: " + vetId);
        
        List<VetClinicMembership> memberships = membershipRepo.findByVet_Id(vetId);
        System.out.println("Found " + memberships.size() + " clinic memberships");
        
        if (!memberships.isEmpty()) {
            System.out.println("Vet has clinic memberships, cannot delete");
            return false;
        }
        
        long appointmentCount = appointmentRepository.countByVetIdAndStatusPendingOrAccepted(vetId);
        System.out.println("Found " + appointmentCount + " pending/accepted appointments");
        
        boolean canDelete = appointmentCount == 0;
        System.out.println("Final canDelete result: " + canDelete);
        return canDelete;
    }

    private VetDTO toDto(Vet v) {
        UUID mainClinic = null;
        if (v.getMemberships() != null && !v.getMemberships().isEmpty()) {
            mainClinic = v.getMemberships().stream()
                    .findFirst()
                    .map(m -> m.getClinic().getId())
                    .orElse(null);
        }

        return new VetDTO(
                v.getId(),
                v.getFullName(),
                v.getPassword(),
                v.getEmail(),
                v.getPhone(),
                mainClinic,
                v.getSpecialities(),
                v.isActive()

        );
    }

    private Vet toEntity(VetDTO dto) {
        String specs = java.util.Arrays.stream(dto.specialities().split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(s -> s.substring(0,1).toUpperCase() + s.substring(1).toLowerCase())
                .collect(java.util.stream.Collectors.joining(", "));

        return Vet.builder()
                .fullName(dto.fullName())
                .email(dto.email().toLowerCase().trim())
                .phone(dto.phone())
                .specialities(specs)
                .password(passwordEncoder.encode(dto.password()))
                .isActive(Boolean.TRUE.equals(dto.isActive()))
                .build();
    }







}
