package org.example.backend.data;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EqualsAndHashCode
public class ClinicAccountId implements Serializable {

    @Column(name = "clinic_id", nullable = false)
    private UUID clinicId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;
}
