package com.rafeeq.backend.dto.teacher;

import com.rafeeq.backend.entity_enums.Gender;
import com.rafeeq.backend.entity_enums.LearningDifficulty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateStudentRequest {
    private String fullNameAr;
    private String fullNameEn;
    private String className;
    private Integer level;
    private Gender gender;
    private LocalDate dateOfBirth;
    private LearningDifficulty learningDifficulty;
}