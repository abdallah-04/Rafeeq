package com.rafeeq.backend.dto.teacher;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateStudentRequest {
    @JsonAlias({"fullName", "name"})
    @NotBlank(message = "Child name is required")
    private String fullNameAr;
    private String fullNameEn;
    private String className;
    private String level;

    @NotBlank(message = "Gender is required")
    private String gender;

    @PastOrPresent(message = "Date of birth cannot be in the future")
    private LocalDate dateOfBirth;

    @JsonAlias({"condition", "specialNeed"})
    @NotBlank(message = "Learning difficulty is required")
    private String learningDifficulty;

    @Pattern(regexp = "^$|^\\+?[0-9]{8,15}$", message = "Phone format is invalid")
    private String phone;

    @NotBlank(message = "National ID is required")
    @Size(max = 100, message = "National ID is too long")
    private String nationalId;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
