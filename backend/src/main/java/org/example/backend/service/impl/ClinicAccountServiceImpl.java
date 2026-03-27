package org.example.backend.service.impl;

import org.example.backend.data.ClinicAccount;
import org.example.backend.data.ClinicAccountId;
import org.example.backend.data.User;
import org.example.backend.data.VeterinaryClinic;
import org.example.backend.dto.ClinicAccountDTO;
import org.example.backend.exception.ClinicAccountException;
import org.example.backend.repository.ClinicAccountRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.VeterinaryClinicRepository;
import org.example.backend.repository.VetRepository;
import org.example.backend.service.ClinicAccountService;
import org.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service("clinicAccountService")
public class ClinicAccountServiceImpl implements ClinicAccountService {

    private final ClinicAccountRepository clinicAccountRepository;
    private final UserRepository userRepository;
    private final VeterinaryClinicRepository clinicRepository;
    private final UserService userService;
    private final VetRepository vetRepository;

    @Autowired
    public ClinicAccountServiceImpl(
            ClinicAccountRepository clinicAccountRepository,
            UserRepository userRepository,
            VeterinaryClinicRepository clinicRepository,
            UserService userService,
            VetRepository vetRepository) {
        this.clinicAccountRepository = clinicAccountRepository;
        this.userRepository = userRepository;
        this.clinicRepository = clinicRepository;
        this.userService = userService;
        this.vetRepository = vetRepository;
    }

    @Override
    @Transactional
    public ClinicAccountDTO createClinicAccount(UUID clinicId, UUID userId, String staffRole) {
        if (clinicAccountRepository.existsById_UserIdAndId_ClinicId(userId, clinicId)) {
            throw new ClinicAccountException("Clinic account already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ClinicAccountException("User not found"));

        VeterinaryClinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new ClinicAccountException("Clinic not found"));

        try {
            ClinicAccount account = new ClinicAccount();
            account.setId(new ClinicAccountId(clinicId, userId));
            account.setClinic(clinic);
            account.setUser(user);
            account.setStaffRole(ClinicAccount.StaffRole.valueOf(staffRole.toUpperCase()));

            return ClinicAccountDTO.fromEntity(clinicAccountRepository.save(account));
        } catch (IllegalArgumentException e) {
            throw new ClinicAccountException("Invalid staff role: " + staffRole);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClinicAccountDTO> getClinicAccountsByUserId(UUID userId) {
        return clinicAccountRepository.findById_UserId(userId).stream()
                .map(ClinicAccountDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClinicAccountDTO> getClinicAccountsByClinicId(UUID clinicId) {
        return clinicAccountRepository.findById_ClinicId(clinicId).stream()
                .map(ClinicAccountDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteClinicAccount(UUID clinicId, UUID userId) {
        ClinicAccountId id = new ClinicAccountId(clinicId, userId);
        if (!clinicAccountRepository.existsById(id)) {
            throw new ClinicAccountException("Clinic account not found");
        }
        clinicAccountRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void updateStaffRole(UUID clinicId, UUID userId, String newRole) {
        ClinicAccountId id = new ClinicAccountId(clinicId, userId);
        ClinicAccount account = clinicAccountRepository.findById(id)
                .orElseThrow(() -> new ClinicAccountException("Clinic account not found"));

        try {
            account.setStaffRole(ClinicAccount.StaffRole.valueOf(newRole.toUpperCase()));
            clinicAccountRepository.save(account);
        } catch (IllegalArgumentException e) {
            throw new ClinicAccountException("Invalid staff role: " + newRole);
        }
    }

    @Override
    public boolean hasClinicAccess(String identifier, UUID clinicId) {
        try {
            UUID userId = UUID.fromString(identifier);
            if (clinicAccountRepository.existsById_UserIdAndId_ClinicId(userId, clinicId)) return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
        try {
            UUID vetId = UUID.fromString(identifier);
            return vetRepository.findByClinic(clinicId).stream().anyMatch(v -> v.getId().equals(vetId));
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasClinicAccess(UUID userId, UUID clinicId) {
        return clinicAccountRepository.existsById_UserIdAndId_ClinicId(userId, clinicId);
    }

    @Override
    public String getClinicOwnerEmail(UUID clinicId) {
        return clinicAccountRepository.findById_ClinicId(clinicId).stream()
                .filter(acc -> acc.getStaffRole() == org.example.backend.data.ClinicAccount.StaffRole.OWNER)
                .map(acc -> acc.getUser().getEmail())
                .findFirst().orElse(null);
    }
} 