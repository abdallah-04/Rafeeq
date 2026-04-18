package com.rafeeq.backend.auth;

import com.rafeeq.backend.dto.auth.*;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.School;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.AppLanguage;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.SchoolRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public AuthResponse registerParent(RegisterParentRequest request) {
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone already exists");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (request.getNationalId() != null && userRepository.existsByNationalId(request.getNationalId())) {
            throw new RuntimeException("National ID already exists");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setRole(UserRole.PARENT);
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setNationalId(request.getNationalId());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setLanguage(AppLanguage.AR);
        user.setIsActive(true);
        user.setIsVerified(true);

        userRepository.save(user);

        Parent parent = new Parent();
        parent.setId(UUID.randomUUID());
        parent.setUser(user);
        parent.setFullNameAr(request.getFullNameAr());
        parent.setFullNameEn(request.getFullNameEn());

        parentRepository.save(parent);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getNationalId());
        String token = jwtService.generateToken(userDetails, user.getRole().name(), user.getId().toString());

        return new AuthResponse(token, user.getRole().name(), "Parent registered successfully");
    }

    public AuthResponse registerSchool(RegisterSchoolRequest request) {
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone already exists");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (request.getNationalId() != null && userRepository.existsByNationalId(request.getNationalId())) {
            throw new RuntimeException("National ID already exists");
        }

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setRole(UserRole.SCHOOL);
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setNationalId(request.getNationalId());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setLanguage(AppLanguage.AR);
        user.setIsActive(true);
        user.setIsVerified(true);

        userRepository.save(user);

        School school = new School();
        school.setId(UUID.randomUUID());
        school.setUser(user);
        school.setNameAr(request.getNameAr());
        school.setNameEn(request.getNameEn());
        school.setLocation(request.getLocation());
        school.setDescription(request.getDescription());

        schoolRepository.save(school);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getNationalId());
        String token = jwtService.generateToken(userDetails, user.getRole().name(), user.getId().toString());

        return new AuthResponse(token, user.getRole().name(), "School registered successfully");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByNationalId(request.getNationalId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getNationalId(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getNationalId());
        String token = jwtService.generateToken(userDetails, user.getRole().name(), user.getId().toString());

        return new AuthResponse(token, user.getRole().name(), "Login successful");
    }

    public MeResponse me(String nationalId) {
        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new MeResponse(
                user.getId(),
                user.getRole().name(),
                user.getEmail(),
                user.getPhone()
        );
    }
}