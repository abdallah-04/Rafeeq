package com.rafeeq.backend.dto.note;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateNoteRequest {
    @NotNull(message = "Child ID is required")
    private UUID childId;

    @NotBlank(message = "Note title is required")
    private String title;

    @NotBlank(message = "Note content is required")
    private String content;
}
