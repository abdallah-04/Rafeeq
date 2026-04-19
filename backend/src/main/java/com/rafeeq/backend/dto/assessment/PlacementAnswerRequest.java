package com.rafeeq.backend.dto.assessment;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class PlacementAnswerRequest {
    @NotNull(message = "Question ID is required")
    private UUID questionId;

    @NotNull(message = "Selected option is required")
    @Min(value = 1, message = "Selected option must be between 1 and 4")
    @Max(value = 4, message = "Selected option must be between 1 and 4")
    private Integer selectedOption;
}
