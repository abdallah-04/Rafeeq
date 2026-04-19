package com.rafeeq.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterSchoolRequest {
    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Phone format is invalid")
    private String phone;

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "National ID is required")
    @Size(max = 100, message = "National ID is too long")
    private String nationalId;

    @NotBlank(message = "School Arabic name is required")
    private String nameAr;
    private String nameEn;

    @NotBlank(message = "School location is required")
    private String location;
    private String description;
}
