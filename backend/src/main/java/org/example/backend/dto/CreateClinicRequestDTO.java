package org.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateClinicRequestDTO {
    @NotBlank
    private String name;
    
    @NotBlank
    private String address;
    
    @NotBlank
    private String phone;
    
    @Email
    private String email;
    
    @NotBlank
    private String city;
    
    @NotNull
    private BigDecimal latitude;
    
    @NotNull
    private BigDecimal longitude;
    
    @NotNull
    private UUID ownerId;
} 