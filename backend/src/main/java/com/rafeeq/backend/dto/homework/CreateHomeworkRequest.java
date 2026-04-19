package com.rafeeq.backend.dto.homework;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateHomeworkRequest {
    private UUID childId;
    private String title;
    private String description;
    private LocalDate dueDate;
}