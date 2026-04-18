package com.rafeeq.backend.dto.auth;

import lombok.Data;

@Data
public class ResendOtpRequest {
    private String nationalId;
}