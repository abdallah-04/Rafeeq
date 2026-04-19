package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.teacher.StudentResponse;
import com.rafeeq.backend.dto.teacher.UpdateStudentRequest;
import com.rafeeq.backend.service.TeacherStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherStudentService teacherStudentService;

    @GetMapping("/students")
    public ResponseEntity<List<StudentResponse>> getStudents(Authentication auth) {
        return ResponseEntity.ok(
                teacherStudentService.getMyStudents(auth.getName())
        );
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentResponse> getStudent(
            @PathVariable UUID id,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                teacherStudentService.getStudentById(id, auth.getName())
        );
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable UUID id,
            @RequestBody UpdateStudentRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                teacherStudentService.updateStudent(id, request, auth.getName())
        );
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<MessageResponse> deleteStudent(
            @PathVariable UUID id,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                teacherStudentService.deleteStudent(id, auth.getName())
        );
    }
}