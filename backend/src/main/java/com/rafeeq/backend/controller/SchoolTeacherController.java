package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.school.CreateTeacherRequest;
import com.rafeeq.backend.dto.school.TeacherResponse;
import com.rafeeq.backend.dto.school.UpdateTeacherRequest;
import com.rafeeq.backend.dto.teacher.StudentResponse;
import com.rafeeq.backend.service.SchoolTeacherService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/school/teachers")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SchoolTeacherController {

    private final SchoolTeacherService schoolTeacherService;

    @PostMapping
    public ResponseEntity<TeacherResponse> createTeacher(
            @Valid @RequestBody CreateTeacherRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(schoolTeacherService.createTeacher(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<TeacherResponse>> getMyTeachers(Authentication authentication) {
        return ResponseEntity.ok(schoolTeacherService.getMyTeachers(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherResponse> getTeacherById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(schoolTeacherService.getTeacherById(id, authentication.getName()));
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<List<StudentResponse>> getTeacherStudents(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(schoolTeacherService.getTeacherStudents(id, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherResponse> updateTeacher(
            @PathVariable UUID id,
            @RequestBody UpdateTeacherRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(schoolTeacherService.updateTeacher(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteTeacher(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(schoolTeacherService.deleteTeacher(id, authentication.getName()));
    }
}
