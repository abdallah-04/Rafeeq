package com.rafeeq.backend.dto.teacher;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateStudentRequest {
    private String fullNameAr;
    private String fullNameEn;
    private String className;
    private String level;
    private String gender;
    private LocalDate dateOfBirth;
    private String learningDifficulty;
    private String phone;
    private String nationalId;
    private String password;
}