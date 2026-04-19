package com.rafeeq.backend.dto.homework;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateHomeworkRequest {
    @NotNull(message = "Child ID is required")
    private UUID childId;

    @NotBlank(message = "Homework title is required")
    private String title;

    @NotBlank(message = "Homework description is required")
    private String description;

    @NotNull(message = "Due date is required")
    @FutureOrPresent(message = "Due date cannot be in the past")
    private LocalDate dueDate;
}
