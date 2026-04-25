package com.rafeeq.backend.dto.quiz;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionResponse {
    private UUID id;
    private String question;
    private List<String> options;
    private Integer correctOption;
    private String explanation;
    private Integer orderNum;
    private Integer points;
}
