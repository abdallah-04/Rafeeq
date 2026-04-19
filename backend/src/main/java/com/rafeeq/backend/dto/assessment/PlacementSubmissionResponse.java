package com.rafeeq.backend.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlacementSubmissionResponse {
    private UUID childId;
    private UUID assessmentId;
    private Integer resultLevel;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Integer confidencePercentage;
    private String detectedDifficulty;
    private String childStatus;
    private boolean active;
    private LocalDateTime placementCompletedAt;
}
