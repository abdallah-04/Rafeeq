package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.child.ChildResponse;
import com.rafeeq.backend.service.SchoolTeacherService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/school/students")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class SchoolStudentController {

    private final SchoolTeacherService schoolTeacherService;

    @GetMapping("/{id}")
    public ResponseEntity<ChildResponse> getStudentById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(schoolTeacherService.getSchoolStudentById(id, authentication.getName()));
    }
}
