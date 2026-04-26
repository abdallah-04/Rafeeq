package com.rafeeq.backend.dto.quiz;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnswerSubmissionRequest {
    @NotNull(message = "Question id is required")
    private UUID questionId;

    @NotBlank(message = "Selected option is required")
    private String selectedOption;
}
