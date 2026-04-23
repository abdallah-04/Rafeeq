package com.rafeeq.backend.dto.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateReportRequest {
    @NotNull(message = "Child ID is required")
    private UUID childId;

    @NotBlank(message = "Report title is required")
    private String title;

    @NotBlank(message = "Report content is required")
    private String content;
}
