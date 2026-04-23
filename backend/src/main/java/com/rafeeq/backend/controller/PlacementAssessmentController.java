package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.assessment.PlacementAssessmentResponse;
import com.rafeeq.backend.dto.assessment.PlacementSubmissionResponse;
import com.rafeeq.backend.dto.assessment.SubmitPlacementRequest;
import com.rafeeq.backend.service.PlacementAssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/api/teacher/students/{childId}/placement", "/teacher/students/{childId}/placement"})
@RequiredArgsConstructor
public class PlacementAssessmentController {

    private final PlacementAssessmentService placementAssessmentService;

    @GetMapping
    public ResponseEntity<PlacementAssessmentResponse> getPlacementAssessment(
            @PathVariable UUID childId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                placementAssessmentService.getPlacementAssessment(childId, authentication.getName())
        );
    }

    @PostMapping
    public ResponseEntity<PlacementAssessmentResponse> startPlacementAssessment(
            @PathVariable UUID childId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                placementAssessmentService.getPlacementAssessment(childId, authentication.getName())
        );
    }

    @PostMapping("/submit")
    public ResponseEntity<PlacementSubmissionResponse> submitPlacementAssessment(
            @PathVariable UUID childId,
            @Valid @RequestBody SubmitPlacementRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                placementAssessmentService.submitPlacement(childId, request, authentication.getName())
        );
    }
}
