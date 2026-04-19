package com.rafeeq.backend.controller;

import com.rafeeq.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/parent")
    public ResponseEntity<?> parent(Authentication auth) {
        return ResponseEntity.ok(
                dashboardService.parent(auth.getName())
        );
    }

    @GetMapping("/teacher")
    public ResponseEntity<?> teacher(Authentication auth) {
        return ResponseEntity.ok(
                dashboardService.teacher(auth.getName())
        );
    }

    @GetMapping("/school")
    public ResponseEntity<?> school(Authentication auth) {
        return ResponseEntity.ok(
                dashboardService.school(auth.getName())
        );
    }
}