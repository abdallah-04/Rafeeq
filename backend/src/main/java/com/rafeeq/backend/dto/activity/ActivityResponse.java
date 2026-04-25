package com.rafeeq.backend.dto.activity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private UUID id;
    private UUID childId;
    private UUID treeId;
    private UUID treeItemId;
    private String title;
    private String description;
    private String instructions;
    private String materialsNeeded;
    private String expectedOutcome;
    private String status;
    private Integer groupNumber;
    private Integer orderNum;
    private LocalDateTime completedAt;
}
