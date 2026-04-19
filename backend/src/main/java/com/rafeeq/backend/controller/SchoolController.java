package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.school.CreateTeacherRequest;
import com.rafeeq.backend.dto.school.TeacherResponse;
import com.rafeeq.backend.dto.school.UpdateTeacherRequest;
import com.rafeeq.backend.service.SchoolTeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/school")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolTeacherService schoolTeacherService;

    @PostMapping("/teachers")
    public ResponseEntity<TeacherResponse> createTeacher(
            @Valid @RequestBody CreateTeacherRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                schoolTeacherService.createTeacher(request, auth.getName())
        );
    }

    @GetMapping("/teachers")
    public ResponseEntity<?> getTeachers(Authentication auth) {
        return ResponseEntity.ok(schoolTeacherService.getAll(auth.getName()));
    }

    @GetMapping("/teachers/{id}")
    public ResponseEntity<?> getTeacher(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(
                schoolTeacherService.getOne(id, auth.getName())
        );
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<TeacherResponse> updateTeacher(
            @PathVariable UUID id,
            @RequestBody UpdateTeacherRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                schoolTeacherService.update(id, request, auth.getName())
        );
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<MessageResponse> deleteTeacher(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(schoolTeacherService.delete(id, auth.getName()));
    }
}
