package org.example.backend.repository;

import org.example.backend.data.ClinicAccount;
import org.example.backend.data.ClinicAccountId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClinicAccountRepository extends JpaRepository<ClinicAccount, ClinicAccountId> {

    List<ClinicAccount> findById_UserId(UUID userId);

    List<ClinicAccount> findById_ClinicId(UUID clinicId);

    boolean existsById_UserIdAndId_ClinicId(UUID userId, UUID clinicId);

    List<ClinicAccount> findById_UserIdAndStaffRole(UUID userId, ClinicAccount.StaffRole staffRole);

    void deleteById_UserId(UUID userId);
}