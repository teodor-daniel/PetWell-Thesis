package org.example.backend.data;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vet_clinic_memberships", schema = "dev", uniqueConstraints = @UniqueConstraint(columnNames = {"vet_id", "clinic_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VetClinicMembership {

    @EmbeddedId
    private Id id = new Id();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("vetId")
    @JoinColumn(name = "vet_id", nullable = false)
    private Vet vet;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("clinicId")
    @JoinColumn(name = "clinic_id", nullable = false)
    private VeterinaryClinic clinic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Role role = Role.PRIMARY;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt = LocalDateTime.now();

    public enum Role {PRIMARY, LOCUM}

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Id implements Serializable {
        @Column(name = "vet_id", nullable = false)
        private UUID vetId;

        @Column(name = "clinic_id", nullable = false)
        private UUID clinicId;
    }

    public static VetClinicMembership connect(Vet vet, VeterinaryClinic clinic, Role role) {
        VetClinicMembership link = new VetClinicMembership();
        link.setVet(vet);
        link.setClinic(clinic);
        link.setRole(role);

        vet.getMemberships().add(link);
        clinic.getMemberships().add(link);
        return link;
    }
}
