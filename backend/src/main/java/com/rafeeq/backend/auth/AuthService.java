package com.rafeeq.backend.auth;

import com.rafeeq.backend.common.ConflictException;
import com.rafeeq.backend.common.NotFoundException;
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

import java.time.LocalDateTime;
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
            throw new ConflictException("Phone already exists");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (request.getNationalId() != null && userRepository.existsByNationalId(request.getNationalId())) {
            throw new ConflictException("National ID already exists");
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
        String accessToken = jwtService.generateAccessToken(userDetails, user.getRole().name(), user.getId().toString());
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(accessToken, refreshToken, user.getRole().name(), "Parent registered successfully");
    }

        public MessageResponse resendOtp(ResendOtpRequest request) {
            User user = userRepository.findByNationalId(request.getNationalId())
                    .orElseThrow(() -> new NotFoundException("User not found"));

            String otp = String.valueOf((int) (1000 + Math.random() * 9000));
            user.setOtpCode(otp);
            user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));

            userRepository.save(user);

            System.out.println("DEBUG RESEND OTP for " + user.getNationalId() + ": " + otp);

            return new MessageResponse(true,"OTP resent successfully");
        }

    public AuthResponse registerSchool(RegisterSchoolRequest request) {
        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
           throw new ConflictException("Phone already exists");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (request.getNationalId() != null && userRepository.existsByNationalId(request.getNationalId())) {
            throw new ConflictException("National ID already exists");
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
        String accessToken = jwtService.generateAccessToken(userDetails, user.getRole().name(), user.getId().toString());
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(accessToken, refreshToken, user.getRole().name(), "School registered successfully");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByNationalId(request.getNationalId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getNationalId(),
                        request.getPassword()
                )
        );

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getNationalId());
        String accessToken = jwtService.generateAccessToken(userDetails, user.getRole().name(), user.getId().toString());
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(accessToken, refreshToken, user.getRole().name(), "Login successful");
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByNationalId(request.getNationalId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        String otp = String.valueOf((int) (1000 + Math.random() * 9000));
        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);
        System.out.println("DEBUG OTP for " + user.getNationalId() + ": " + otp);
        return new MessageResponse(true, "OTP sent successfully");
    }

    public MessageResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByNationalId(request.getNationalId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (user.getOtpCode() == null || user.getOtpExpiresAt() == null) {
            throw new RuntimeException("OTP not requested");
        }

        if (!user.getOtpCode().equals(request.getOtpCode())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        return new MessageResponse(true,"OTP verified successfully");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByNationalId(request.getNationalId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        if (user.getOtpCode() == null || user.getOtpExpiresAt() == null) {
            throw new RuntimeException("OTP not requested");
        }

        if (!user.getOtpCode().equals(request.getOtpCode())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);

        userRepository.save(user);

        return new MessageResponse(true,"Password reset successfully");
    }

    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        String tokenType = jwtService.extractTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new RuntimeException("Invalid refresh token");
        }

        String nationalId = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getNationalId());

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new RuntimeException("Refresh token expired or invalid");
        }

        String newAccessToken = jwtService.generateAccessToken(userDetails, user.getRole().name(), user.getId().toString());
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return new RefreshTokenResponse(newAccessToken, newRefreshToken, user.getRole().name());
    }

    public MessageResponse logout(LogoutRequest request) {
        return new MessageResponse(true,"Logged out successfully");
    }

    public MeResponse me(String nationalId) {
        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return new MeResponse(
                user.getId(),
                user.getRole().name(),
                user.getEmail(),
                user.getPhone()
        );
    }
}