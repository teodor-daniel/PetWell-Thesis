package org.example.backend.data;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"clinic", "user"})
@EqualsAndHashCode(of = "id")
@Table(name = "clinic_accounts", schema = "dev")
public class ClinicAccount {

    @EmbeddedId
    private ClinicAccountId id;

    @ManyToOne(optional = false)
    @MapsId("clinicId")
    @JoinColumn(name = "clinic_id", nullable = false)
    private VeterinaryClinic clinic;

    @ManyToOne(optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "staff_role", nullable = false)
    private StaffRole staffRole;

    public enum StaffRole {
        OWNER, STAFF
    }
} 