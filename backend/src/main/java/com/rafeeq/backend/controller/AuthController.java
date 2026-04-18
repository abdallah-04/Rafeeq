package com.rafeeq.backend.controller;

import com.rafeeq.backend.auth.AuthService;
import com.rafeeq.backend.dto.auth.AuthResponse;
import com.rafeeq.backend.dto.auth.LoginRequest;
import com.rafeeq.backend.dto.auth.MeResponse;
import com.rafeeq.backend.dto.auth.RegisterParentRequest;
import com.rafeeq.backend.dto.auth.RegisterSchoolRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register parent")
    @PostMapping("/register/parent")
    public ResponseEntity<AuthResponse> registerParent(@RequestBody RegisterParentRequest request) {
        return ResponseEntity.ok(authService.registerParent(request));
    }

    @Operation(summary = "Register school")
    @PostMapping("/register/school")
    public ResponseEntity<AuthResponse> registerSchool(@RequestBody RegisterSchoolRequest request) {
        return ResponseEntity.ok(authService.registerSchool(request));
    }

    @Operation(summary = "Login")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(
            summary = "Get current user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(authService.me(authentication.getName()));
    }
}