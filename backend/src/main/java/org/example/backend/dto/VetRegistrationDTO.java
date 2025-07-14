package org.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VetRegistrationDTO {

    @NotBlank
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @Pattern(regexp = "^(\\+40|0)?7\\d{8}$")
    private String phone;

    @NotBlank
    private String specialities;

    @Size(min = 8)
    private String password;
}
