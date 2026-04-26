package com.rafeeq.backend.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmissionResponse {
    private UUID quizId;
    private UUID treeId;
    private UUID treeItemId;
    private Integer score;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Integer progressPercentage;
    private boolean treeCompleted;
    private Integer completedItems;
    private Integer totalItems;
    private String treeStatus;
}
