package com.rafeeq.backend.dto.auth;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String nationalId;
}