package com.rafeeq.backend.auth;

import com.rafeeq.backend.common.BadRequestException;
import com.rafeeq.backend.common.ConflictException;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.common.UnauthorizedException;
import com.rafeeq.backend.dto.auth.*;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.School;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity.UserSession;
import com.rafeeq.backend.entity_enums.AppLanguage;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.SchoolRepository;
import com.rafeeq.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;
    private final UserSessionService userSessionService;

    @Transactional
    public AuthResponse registerParent(RegisterParentRequest request, HttpServletRequest httpRequest) {
        validateUniqueUserFields(request.getPhone(), request.getEmail(), request.getNationalId());

        User user = buildUser(
                UserRole.PARENT,
                request.getPhone(),
                request.getEmail(),
                request.getNationalId(),
                request.getPassword(),
                true
        );
        userRepository.save(user);

        Parent parent = new Parent();
        parent.setId(UUID.randomUUID());
        parent.setUser(user);
        parent.setFullNameAr(request.getFullNameAr());
        parent.setFullNameEn(request.getFullNameEn());
        parentRepository.save(parent);

        return issueTokens(user, httpRequest, "Parent registered successfully");
    }

    @Transactional
    public AuthResponse registerSchool(RegisterSchoolRequest request, HttpServletRequest httpRequest) {
        validateUniqueUserFields(request.getPhone(), request.getEmail(), request.getNationalId());

        User user = buildUser(
                UserRole.SCHOOL,
                request.getPhone(),
                request.getEmail(),
                request.getNationalId(),
                request.getPassword(),
                true
        );
        userRepository.save(user);

        School school = new School();
        school.setId(UUID.randomUUID());
        school.setUser(user);
        school.setNameAr(request.getNameAr());
        school.setNameEn(request.getNameEn());
        school.setLocation(request.getLocation());
        school.setDescription(request.getDescription());
        schoolRepository.save(school);

        return issueTokens(user, httpRequest, "School registered successfully");
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByNationalId(request.getNationalId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getNationalId(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Invalid credentials");
        } catch (DisabledException ex) {
            throw new UnauthorizedException("Account is inactive");
        }

        return issueTokens(user, httpRequest, "Login successful");
    }

    @Transactional
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

    @Transactional
    public MessageResponse resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByNationalId(request.getNationalId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        String otp = String.valueOf((int) (1000 + Math.random() * 9000));
        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);

        System.out.println("DEBUG RESEND OTP for " + user.getNationalId() + ": " + otp);

        return new MessageResponse(true, "OTP resent successfully");
    }

    public MessageResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByNationalId(request.getNationalId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        ensureOtpIsValid(user, request.getOtpCode());

        return new MessageResponse(true, "OTP verified successfully");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByNationalId(request.getNationalId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        ensureOtpIsValid(user, request.getOtpCode());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
        userSessionService.revokeAllSessions(user);

        return new MessageResponse(true, "Password reset successfully");
    }

    @Transactional
    public RefreshTokenResponse refresh(RefreshTokenRequest request, HttpServletRequest httpRequest) {
        UserSession currentSession = userSessionService.validateRefreshSession(request.getRefreshToken());
        User user = currentSession.getUser();
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getNationalId());

        if (!jwtService.isTokenValid(request.getRefreshToken(), userDetails)) {
            throw new UnauthorizedException("Refresh token expired or invalid");
        }

        String newAccessToken = jwtService.generateAccessToken(userDetails, user.getRole().name(), user.getId().toString());
        String newRefreshToken = jwtService.generateRefreshToken(userDetails, user.getRole().name(), user.getId().toString());
        userSessionService.rotateSession(currentSession, newRefreshToken, httpRequest);

        return new RefreshTokenResponse(newAccessToken, newRefreshToken, user.getRole().name());
    }

    @Transactional
    public MessageResponse logout(LogoutRequest request) {
        userSessionService.revokeRefreshSession(request.getRefreshToken());
        return new MessageResponse(true, "Logged out successfully");
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

    private void validateUniqueUserFields(String phone, String email, String nationalId) {
        if (phone != null && !phone.isBlank() && userRepository.existsByPhone(phone)) {
            throw new ConflictException("Phone already exists");
        }

        if (email != null && !email.isBlank() && userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already exists");
        }

        if (nationalId != null && !nationalId.isBlank() && userRepository.existsByNationalId(nationalId)) {
            throw new ConflictException("National ID already exists");
        }
    }

    private void ensureOtpIsValid(User user, String otpCode) {
        if (user.getOtpCode() == null || user.getOtpExpiresAt() == null) {
            throw new BadRequestException("OTP not requested");
        }

        if (!user.getOtpCode().equals(otpCode)) {
            throw new BadRequestException("Invalid OTP");
        }

        if (user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP expired");
        }
    }

    private User buildUser(
            UserRole role,
            String phone,
            String email,
            String nationalId,
            String rawPassword,
            boolean active
    ) {
        User user = new User();
        user.setRole(role);
        user.setPhone(phone);
        user.setEmail(email);
        user.setNationalId(nationalId);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setLanguage(AppLanguage.AR);
        user.setIsActive(active);
        user.setIsVerified(true);
        return user;
    }

    private AuthResponse issueTokens(User user, HttpServletRequest httpRequest, String message) {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(user.getNationalId());
        String accessToken = jwtService.generateAccessToken(userDetails, user.getRole().name(), user.getId().toString());
        String refreshToken = jwtService.generateRefreshToken(userDetails, user.getRole().name(), user.getId().toString());
        userSessionService.createSession(user, refreshToken, httpRequest);
        return new AuthResponse(accessToken, refreshToken, user.getRole().name(), message);
    }
}
