package com.rafeeq.backend.controller;

import com.rafeeq.backend.service.SchoolTeacherService;
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

    @GetMapping("/teachers")
    public ResponseEntity<?> getTeachers(Authentication auth) {
        return ResponseEntity.ok(
                schoolTeacherService.getAll(auth.getName())
        );
    }

    @GetMapping("/teachers/{id}")
    public ResponseEntity<?> getTeacher(@PathVariable UUID id) {
        return ResponseEntity.ok(
                schoolTeacherService.getOne(id)
        );
    }

    @PutMapping("/teachers/{id}")
    public ResponseEntity<?> updateTeacher(
            @PathVariable UUID id,
            @RequestBody Object request
    ) {
        return ResponseEntity.ok(
                schoolTeacherService.update(id, request)
        );
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable UUID id) {
        schoolTeacherService.delete(id);

        return ResponseEntity.ok().body(
                java.util.Map.of(
                        "success", true,
                        "message", "Teacher deleted successfully"
                )
        );
    }
}