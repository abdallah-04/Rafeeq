package com.rafeeq.backend.dto.child;

import com.rafeeq.backend.entity_enums.Gender;
import com.rafeeq.backend.entity_enums.LearningDifficulty;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateChildRequest {
    private String fullNameAr;
    private String fullNameEn;
    private String className;
    private Integer level;
    private Gender gender;
    private LocalDate dateOfBirth;
    private LearningDifficulty learningDifficulty;

    private String phone;
    private String email;
    private String nationalId;
    private String password;

    private UUID teacherId;
}