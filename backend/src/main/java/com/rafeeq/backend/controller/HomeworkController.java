package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.homework.CreateHomeworkRequest;
import com.rafeeq.backend.dto.homework.HomeworkResponse;
import com.rafeeq.backend.service.HomeworkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/homework")
@RequiredArgsConstructor
public class HomeworkController {

    private final HomeworkService homeworkService;

    @PostMapping
    public ResponseEntity<HomeworkResponse> addTeacherHomework(
            @Valid @RequestBody CreateHomeworkRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(homeworkService.addTeacherHomework(request, auth.getName()));
    }

    @GetMapping("/teacher/{childId}")
    public ResponseEntity<List<HomeworkResponse>> getTeacherHomework(
            @PathVariable UUID childId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication auth
    ) {
        return ResponseEntity.ok(homeworkService.getTeacherHomework(childId, auth.getName(), acceptLanguage));
    }

    @GetMapping("/parent/{childId}")
    public ResponseEntity<List<HomeworkResponse>> getParentHomework(
            @PathVariable UUID childId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            @RequestParam(value = "source", required = false) String source,
            Authentication auth
    ) {
        return ResponseEntity.ok(homeworkService.getParentHomework(childId, auth.getName(), acceptLanguage, source));
    }

    @GetMapping("/school/{childId}")
    public ResponseEntity<List<HomeworkResponse>> getSchoolHomework(
            @PathVariable UUID childId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication auth
    ) {
        return ResponseEntity.ok(homeworkService.getSchoolHomework(childId, auth.getName(), acceptLanguage));
    }

    @GetMapping("/details/{homeworkId}")
    public ResponseEntity<HomeworkResponse> getHomeworkDetail(
            @PathVariable UUID homeworkId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication auth
    ) {
        return ResponseEntity.ok(homeworkService.getHomeworkDetail(homeworkId, auth.getName(), acceptLanguage));
    }
}
