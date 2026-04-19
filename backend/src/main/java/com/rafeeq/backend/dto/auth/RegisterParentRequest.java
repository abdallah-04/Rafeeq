package com.rafeeq.backend.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterParentRequest {
    private String phone;
    private String email;
    private String password;
    private String nationalId;
    private String fullNameAr;
    private String fullNameEn;
}