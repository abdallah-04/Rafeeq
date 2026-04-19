package com.rafeeq.backend.common;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiSuccessResponse {
    private boolean success;
    private String message;
}