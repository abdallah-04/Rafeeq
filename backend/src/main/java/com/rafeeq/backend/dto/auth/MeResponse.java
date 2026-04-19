package com.rafeeq.backend.dto.auth;


import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class MeResponse {
    private UUID userId;
    private String role;
    private String email;
    private String phone;
}