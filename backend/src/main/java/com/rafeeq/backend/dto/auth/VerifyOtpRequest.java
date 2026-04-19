package com.rafeeq.backend.dto.auth;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String nationalId;
    private String otpCode;
    private Boolean trustDevice;
}