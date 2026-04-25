package com.rafeeq.backend.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse {
    private UUID id;
    private UUID childId;
    private UUID treeId;
    private UUID treeItemId;
    private String title;
    private Integer level;
    private Integer totalQuestions;
    private Integer score;
    private String status;
    private Integer groupNumber;
    private Integer orderNum;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private List<QuizQuestionResponse> questions;
}
