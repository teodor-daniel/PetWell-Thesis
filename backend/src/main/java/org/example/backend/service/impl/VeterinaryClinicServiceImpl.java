package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.data.ClinicAccount;
import org.example.backend.data.User;
import org.example.backend.data.VeterinaryClinic;
import org.example.backend.dto.CreateClinicRequestDTO;
import org.example.backend.dto.VeterinaryClinicDTO;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.AppointmentRepository;
import org.example.backend.repository.ClinicAccountRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.repository.VeterinaryClinicRepository;
import org.example.backend.service.ClinicAccountService;
import org.example.backend.service.VeterinaryClinicService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VeterinaryClinicServiceImpl implements VeterinaryClinicService {

    private final VeterinaryClinicRepository clinicRepo;
    private final ClinicAccountRepository accountRepo;
    private final UserRepository userRepo;
    private final ClinicAccountService clinicAccountService;
    private final AppointmentRepository appointmentRepo;

    @Override
    public VeterinaryClinicDTO getClinic(UUID id) {
        return toDto(clinicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinic", id)));
    }

    @Override
    public List<VeterinaryClinicDTO> getAll() {
        return clinicRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<VeterinaryClinicDTO> getWithinRadius(double lat, double lng, double km) {
        return clinicRepo.findWithinRadius(lat, lng, km).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<VeterinaryClinicDTO> search(String city, String spec) {

        String cityLower = city == null ? null : city.toLowerCase();
        String specLower = spec == null ? null : spec.toLowerCase();

        return clinicRepo.search(cityLower, specLower)
                .stream()
                .map(this::toDto)
                .toList();
    }


    @Override
    public List<VeterinaryClinicDTO> getClinicsByOwner(UUID ownerId) {
        return accountRepo.findById_UserIdAndStaffRole(ownerId, ClinicAccount.StaffRole.OWNER)
                .stream()
                .map(account -> toDto(account.getClinic()))
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public VeterinaryClinicDTO create(VeterinaryClinicDTO dto) {
        if (clinicRepo.existsByEmail(dto.email()))
            throw new IllegalArgumentException("Email already used for a clinic");

        VeterinaryClinic entity = toEntity(dto);
        entity.setId(null);
        return toDto(clinicRepo.save(entity));
    }

    @Override
    @Transactional
    public VeterinaryClinicDTO update(UUID id, VeterinaryClinicDTO dto) {
        VeterinaryClinic c = clinicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinic", id));

        c.setName(dto.name());
        c.setAddress(dto.address());
        c.setPhone(dto.phone());
        c.setEmail(dto.email());
        c.setCity(dto.city());

        if (dto.latitude() != 0) c.setLatitude(BigDecimal.valueOf(dto.latitude()));
        if (dto.longitude() != 0) c.setLongitude(BigDecimal.valueOf(dto.longitude()));

        return toDto(clinicRepo.save(c));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        VeterinaryClinic clinic = clinicRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinic", id));

        if (!clinic.getMemberships().isEmpty()) {
            throw new IllegalStateException("Cannot delete clinic: It has linked veterinarians. Please remove all vets first.");
        }

        OffsetDateTime now = OffsetDateTime.now();
        long futureAppointmentCount = appointmentRepo.countFutureConfirmedAppointmentsByClinicId(id, now);
        if (futureAppointmentCount > 0) {
            throw new IllegalStateException("Cannot delete clinic: It has future confirmed appointments. Please cancel all future appointments first.");
        }

        appointmentRepo.deleteByClinic_Id(id);

        List<ClinicAccount> clinicAccounts = accountRepo.findById_ClinicId(id);
        accountRepo.deleteAll(clinicAccounts);

        clinicRepo.deleteById(id);
    }

    @Override
    @Transactional
    public VeterinaryClinicDTO createClinicWithOwner(CreateClinicRequestDTO r) {

        User owner = userRepo.findById(r.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", r.getOwnerId()));
        VeterinaryClinic clinic = VeterinaryClinic.builder()
                .name(r.getName())
                .address(r.getAddress())
                .phone(r.getPhone())
                .email(r.getEmail())
                .city(r.getCity())
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .build();
        if (clinicRepo.existsByEmail(clinic.getEmail()))
            throw new IllegalArgumentException("Email already used for a clinic");

        VeterinaryClinic savedClinic = clinicRepo.save(clinic);
        clinicAccountService.createClinicAccount(savedClinic.getId(), owner.getId(), "OWNER");

        return toDto(savedClinic);
    }

    @Override
    @Transactional
    public VeterinaryClinicDTO createClinicForOwner(VeterinaryClinicDTO dto, UUID ownerId) {

        VeterinaryClinicDTO createdClinicDto = create(dto);

        clinicAccountService.createClinicAccount(
                createdClinicDto.id(),
                ownerId,
                "OWNER"
        );


        return createdClinicDto;
    }


    private VeterinaryClinicDTO toDto(VeterinaryClinic c) {
        if (c == null) return null;
        return new VeterinaryClinicDTO(
                c.getId(),
                c.getName(),
                c.getAddress(),
                c.getPhone(),
                c.getEmail(),
                c.getCity(),
                c.getLatitude() != null ? c.getLatitude().doubleValue() : 0.0,
                c.getLongitude() != null ? c.getLongitude().doubleValue() : 0.0);
    }


    private VeterinaryClinic toEntity(VeterinaryClinicDTO d) {
        if (d == null) return null;

        BigDecimal lat = (d.latitude() != 0.0) ? BigDecimal.valueOf(d.latitude()) : null;
        BigDecimal lng = (d.longitude() != 0.0) ? BigDecimal.valueOf(d.longitude()) : null;

        return VeterinaryClinic.builder()
                .id(d.id())
                .name(d.name())
                .address(d.address())
                .phone(d.phone())
                .email(d.email())
                .city(d.city())
                .latitude(lat)
                .longitude(lng)
                .build();
    }

}