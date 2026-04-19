package com.rafeeq.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOtpRequest {
    @NotBlank(message = "National ID is required")
    private String nationalId;

    @NotBlank(message = "OTP code is required")
    private String otpCode;
    private Boolean trustDevice;
}
