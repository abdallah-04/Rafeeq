package com.rafeeq.backend.service;

import com.rafeeq.backend.dto.report.CreateReportRequest;
import com.rafeeq.backend.dto.report.ReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    public ReportResponse addTeacherReport(CreateReportRequest request, String nationalId) {
        return new ReportResponse(
                UUID.randomUUID(),
                request.getChildId(),
                request.getTitle(),
                request.getContent(),
                "TEACHER",
                LocalDateTime.now()
        );
    }

    public List<ReportResponse> getTeacherReports(UUID childId, String nationalId) {
        return List.of(
                new ReportResponse(
                        UUID.randomUUID(),
                        childId,
                        "Weekly Progress Report",
                        "Student showed good progress this week.",
                        "TEACHER",
                        LocalDateTime.now()
                )
        );
    }

    public List<ReportResponse> getParentReports(UUID childId, String nationalId) {
        return List.of(
                new ReportResponse(
                        UUID.randomUUID(),
                        childId,
                        "Weekly Progress Report",
                        "Student showed good progress this week.",
                        "TEACHER",
                        LocalDateTime.now()
                )
        );
    }
}