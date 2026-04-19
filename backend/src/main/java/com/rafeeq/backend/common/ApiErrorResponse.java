package com.rafeeq.backend.common;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ApiErrorResponse {
    private boolean success;
    private String message;
    private String code;
    private LocalDateTime timestamp;
}