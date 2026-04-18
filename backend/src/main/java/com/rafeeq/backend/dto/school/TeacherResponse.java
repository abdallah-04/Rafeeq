package com.rafeeq.backend.dto.school;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TeacherResponse {
    private UUID id;
    private UUID userId;
    private String fullNameAr;
    private String fullNameEn;
    private String specialization;
    private UUID schoolId;
}