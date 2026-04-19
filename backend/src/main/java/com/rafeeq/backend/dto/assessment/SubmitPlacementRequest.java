package com.rafeeq.backend.dto.assessment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SubmitPlacementRequest {
    @Valid
    @NotEmpty(message = "At least one placement answer is required")
    private List<PlacementAnswerRequest> answers;
}
