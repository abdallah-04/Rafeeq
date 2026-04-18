package com.rafeeq.backend.dto.school;

import lombok.Data;

@Data
public class CreateTeacherRequest {
    private String fullNameAr;
    private String fullNameEn;
    private String specialization;

    private String phone;
    private String email;
    private String nationalId;
    private String password;
}