package com.rafeeq.backend.dto.school;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateTeacherRequest {
    @JsonAlias("fullName")
    @NotBlank(message = "Teacher name is required")
    private String fullNameAr;
    private String fullNameEn;
    private String specialization;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Phone format is invalid")
    private String phone;

    @Email(message = "Email format is invalid")
    private String email;

    @NotBlank(message = "National ID is required")
    @Size(max = 100, message = "National ID is too long")
    private String nationalId;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String confirmPassword;
}
