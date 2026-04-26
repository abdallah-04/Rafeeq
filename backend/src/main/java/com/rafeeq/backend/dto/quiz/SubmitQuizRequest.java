package com.rafeeq.backend.dto.quiz;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizRequest {
    @Valid
    @NotEmpty(message = "Quiz answers are required")
    private List<QuizAnswerSubmissionRequest> answers;
}
