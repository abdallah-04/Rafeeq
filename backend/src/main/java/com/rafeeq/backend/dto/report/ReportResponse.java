package com.rafeeq.backend.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportResponse {
    private UUID id;
    private UUID childId;
    private String title;
    private String content;
    private String authorRole;
    private LocalDateTime createdAt;
}