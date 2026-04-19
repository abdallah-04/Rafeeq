package com.rafeeq.backend.dto.report;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateReportRequest {
    private UUID childId;
    private String title;
    private String content;
}