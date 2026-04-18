package com.rafeeq.backend.dto.school;

import lombok.Data;

@Data
public class UpdateTeacherRequest {
    private String fullNameAr;
    private String fullNameEn;
    private String specialization;
}