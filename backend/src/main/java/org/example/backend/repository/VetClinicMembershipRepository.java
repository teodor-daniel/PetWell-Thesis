package org.example.backend.repository;

import org.example.backend.data.VetClinicMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VetClinicMembershipRepository extends JpaRepository<VetClinicMembership, VetClinicMembership.Id> {

    List<VetClinicMembership> findByClinic_Id(UUID clinicId);

    List<VetClinicMembership> findByVet_Id(UUID vetId);

    boolean existsByVet_IdAndClinic_Id(UUID vetId, UUID clinicId);

    void deleteByVet_IdAndClinic_Id(UUID vetId, UUID clinicId);

    boolean existsByVetIdAndClinicId(UUID vetId, UUID clinicId);

    void deleteByVetIdAndClinicId(UUID vetId, UUID clinicId);
}
