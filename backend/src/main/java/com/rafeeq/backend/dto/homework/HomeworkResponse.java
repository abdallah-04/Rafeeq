package com.rafeeq.backend.dto.homework;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HomeworkResponse {
    private UUID id;
    private UUID childId;
    private String title;
    private String description;
    private LocalDate dueDate;
    private String status;
    private String authorRole;
    private LocalDateTime createdAt;
}