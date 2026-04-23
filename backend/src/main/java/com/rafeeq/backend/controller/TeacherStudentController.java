package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.teacher.CreateStudentRequest;
import com.rafeeq.backend.dto.teacher.StudentResponse;
import com.rafeeq.backend.dto.teacher.UpdateStudentRequest;
import com.rafeeq.backend.service.TeacherStudentService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/teacher/students")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TeacherStudentController {

    private final TeacherStudentService teacherStudentService;

    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(
            @Valid @RequestBody CreateStudentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teacherStudentService.createStudent(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getMyStudents(Authentication authentication) {
        return ResponseEntity.ok(teacherStudentService.getMyStudents(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teacherStudentService.getStudentById(id, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable UUID id,
            @RequestBody UpdateStudentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teacherStudentService.updateStudent(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteStudent(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teacherStudentService.deleteStudent(id, authentication.getName()));
    }
}
