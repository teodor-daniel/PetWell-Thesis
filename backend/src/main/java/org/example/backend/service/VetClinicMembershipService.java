package org.example.backend.service;

import org.example.backend.data.VetClinicMembership;

import java.util.List;
import java.util.UUID;

public interface VetClinicMembershipService {

    List<UUID> clinicsForVet(UUID vetId);

    List<UUID> vetsForClinic(UUID clinicId);

    void add(UUID vetId, UUID clinicId, VetClinicMembership.Role role);

    void remove(UUID vetId, UUID clinicId);

    boolean isOwner(String userId, UUID clinicId);

    boolean isVetForClinic(String vetId, UUID clinicId);
}
