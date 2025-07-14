package org.example.backend.data;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointment_locks", schema = "dev", uniqueConstraints = @UniqueConstraint(columnNames = {"vet_id", "appointment_time"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentLock {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vet_id")
    private Vet vet;

    @Column(name = "appointment_time", nullable = false)
    private OffsetDateTime appointmentTime;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;
}