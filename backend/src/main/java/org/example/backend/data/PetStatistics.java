package org.example.backend.data;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pet_statistics", schema = "dev")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetStatistics {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "previous_weight")
    private BigDecimal previousWeight;

    @Column(name = "current_weight")
    private BigDecimal currentWeight;

    @Column(name = "previous_build", length = 10)
    private String previousBuild;

    @Column(name = "current_build", length = 10)
    private String currentBuild;

    @Column(name = "changed_at", nullable = false)
    private OffsetDateTime changedAt = OffsetDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (changedAt == null) {
            changedAt = OffsetDateTime.now();
        }
    }
} 