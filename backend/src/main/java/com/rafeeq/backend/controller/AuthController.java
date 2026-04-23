package com.rafeeq.backend.controller;

import com.rafeeq.backend.auth.AuthService;
import com.rafeeq.backend.dto.auth.AuthResponse;
import com.rafeeq.backend.dto.auth.ForgotPasswordRequest;
import com.rafeeq.backend.dto.auth.LoginRequest;
import com.rafeeq.backend.dto.auth.LogoutRequest;
import com.rafeeq.backend.dto.auth.MeResponse;
import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.auth.RefreshTokenRequest;
import com.rafeeq.backend.dto.auth.RefreshTokenResponse;
import com.rafeeq.backend.dto.auth.RegisterParentRequest;
import com.rafeeq.backend.dto.auth.RegisterSchoolRequest;
import com.rafeeq.backend.dto.auth.ResendOtpRequest;
import com.rafeeq.backend.dto.auth.ResetPasswordRequest;
import com.rafeeq.backend.dto.auth.VerifyOtpRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
    public ResponseEntity<AuthResponse> registerParent(@Valid @RequestBody RegisterParentRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.registerParent(request, httpRequest));
    }

    @Operation(summary = "Register school")
    @PostMapping("/register/school")
    public ResponseEntity<AuthResponse> registerSchool(@Valid @RequestBody RegisterSchoolRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.registerSchool(request, httpRequest));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<MessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<MessageResponse> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        return ResponseEntity.ok(authService.resendOtp(request));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.refresh(request, httpRequest));
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(@Valid @RequestBody LogoutRequest request) {
        return ResponseEntity.ok(authService.logout(request));
    }

    @Operation(summary = "Login")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(request, httpRequest));
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
