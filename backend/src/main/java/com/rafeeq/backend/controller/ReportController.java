package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.report.CreateReportRequest;
import com.rafeeq.backend.dto.report.ReportResponse;
import com.rafeeq.backend.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponse> addTeacherReport(
            @Valid @RequestBody CreateReportRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(reportService.addTeacherReport(request, auth.getName()));
    }

    @GetMapping("/teacher/{childId}")
    public ResponseEntity<List<ReportResponse>> getTeacherReports(
            @PathVariable UUID childId,
            Authentication auth
    ) {
        return ResponseEntity.ok(reportService.getTeacherReports(childId, auth.getName()));
    }

    @GetMapping("/parent/{childId}")
    public ResponseEntity<List<ReportResponse>> getParentReports(
            @PathVariable UUID childId,
            Authentication auth
    ) {
        return ResponseEntity.ok(reportService.getParentReports(childId, auth.getName()));
    }

    @GetMapping("/school/{childId}")
    public ResponseEntity<List<ReportResponse>> getSchoolReports(
            @PathVariable UUID childId,
            Authentication auth
    ) {
        return ResponseEntity.ok(reportService.getSchoolReports(childId, auth.getName()));
    }
}
