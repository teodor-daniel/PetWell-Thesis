/* src/main/java/org/example/backend/data/Appointment.java */
package org.example.backend.data;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments", schema = "dev", uniqueConstraints = @UniqueConstraint(columnNames = {"vet_id", "appointment_date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pet_id")
    private Pet pet;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vet_id")
    private Vet vet;

    @ManyToOne(optional = false)
    @JoinColumn(name = "clinic_id")
    private VeterinaryClinic clinic;

    @Column(name = "appointment_date", nullable = false)
    private OffsetDateTime appointmentDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Status status = Status.PENDING;

    @Column(columnDefinition = "text")
    private String notes;

    @Column(name = "type", length = 64, nullable = false)
    private String type;

    public enum Status {PENDING, CONFIRMED, CANCELLED}
}
