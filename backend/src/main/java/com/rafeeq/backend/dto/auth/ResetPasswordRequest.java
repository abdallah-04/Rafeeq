package com.rafeeq.backend.dto.auth;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String nationalId;
    private String otpCode;
    private String newPassword;
    private String confirmPassword;
}