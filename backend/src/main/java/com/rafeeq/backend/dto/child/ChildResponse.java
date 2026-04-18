package com.rafeeq.backend.dto.child;

import com.rafeeq.backend.entity_enums.Gender;
import com.rafeeq.backend.entity_enums.LearningDifficulty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChildResponse {
    private UUID id;
    private UUID userId;
    private String fullNameAr;
    private String fullNameEn;
    private String className;
    private Integer level;
    private Gender gender;
    private LocalDate dateOfBirth;
    private LearningDifficulty learningDifficulty;
    private UUID parentId;
    private UUID teacherId;
}