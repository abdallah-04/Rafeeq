package com.rafeeq.backend.dto.child;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChildSummaryResponse {
    private UUID childId;
    private String childName;
    private Integer level;
    private String difficulty;
    private int quizzesCount;
    private int homeworksCount;
    private int activitiesCount;
    private int progressPercentage;
}