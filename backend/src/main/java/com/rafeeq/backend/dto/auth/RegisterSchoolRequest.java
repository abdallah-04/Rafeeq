package com.rafeeq.backend.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterSchoolRequest {
    private String phone;
    private String email;
    private String password;
    private String nationalId;
    private String nameAr;
    private String nameEn;
    private String location;
    private String description;
}