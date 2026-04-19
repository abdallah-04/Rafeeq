package com.rafeeq.backend.auth;

import com.rafeeq.backend.common.BadRequestException;
import com.rafeeq.backend.common.UnauthorizedException;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity.UserSession;
import com.rafeeq.backend.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserSessionService {

    private final UserSessionRepository userSessionRepository;
    private final JwtService jwtService;

    @Transactional
    public void createSession(User user, String refreshToken, HttpServletRequest request) {
        UserSession session = new UserSession();
        session.setUser(user);
        session.setRefreshTokenHash(hashToken(refreshToken));
        session.setExpiresAt(LocalDateTime.ofInstant(jwtService.extractExpiration(refreshToken).toInstant(), ZoneId.systemDefault()));
        session.setDeviceName(extractDeviceName(request));
        session.setIpAddress(extractIpAddress(request));
        session.setUserAgent(request != null ? request.getHeader("User-Agent") : null);
        session.setLastUsedAt(LocalDateTime.now());
        userSessionRepository.save(session);
    }

    @Transactional
    public UserSession validateRefreshSession(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }

        String refreshTokenHash = hashToken(refreshToken);
        UserSession session = userSessionRepository.findByRefreshTokenHash(refreshTokenHash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token revoked or invalid"));

        if (session.getRevokedAt() != null) {
            throw new UnauthorizedException("Refresh token revoked or invalid");
        }

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setRevokedAt(LocalDateTime.now());
            userSessionRepository.save(session);
            throw new UnauthorizedException("Refresh token expired or invalid");
        }

        return session;
    }

    @Transactional
    public void rotateSession(UserSession currentSession, String newRefreshToken, HttpServletRequest request) {
        currentSession.setRevokedAt(LocalDateTime.now());
        currentSession.setLastUsedAt(LocalDateTime.now());
        userSessionRepository.save(currentSession);
        createSession(currentSession.getUser(), newRefreshToken, request);
    }

    @Transactional
    public void revokeRefreshSession(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadRequestException("Refresh token is required");
        }

        Optional<UserSession> sessionOptional = userSessionRepository.findByRefreshTokenHash(hashToken(refreshToken));
        if (sessionOptional.isPresent()) {
            UserSession session = sessionOptional.get();
            if (session.getRevokedAt() == null) {
                session.setRevokedAt(LocalDateTime.now());
                session.setLastUsedAt(LocalDateTime.now());
                userSessionRepository.save(session);
            }
        }
    }

    @Transactional
    public void revokeAllSessions(User user) {
        for (UserSession session : userSessionRepository.findByUserIdAndRevokedAtIsNull(user.getId())) {
            session.setRevokedAt(LocalDateTime.now());
            session.setLastUsedAt(LocalDateTime.now());
        }
    }

    public String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Unable to hash refresh token", ex);
        }
    }

    private String extractIpAddress(HttpServletRequest request) {
        if (request == null) {
            return null;
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

    private String extractDeviceName(HttpServletRequest request) {
        if (request == null) {
            return null;
        }

        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null || userAgent.isBlank()) {
            return null;
        }

        return userAgent.length() > 255 ? userAgent.substring(0, 255) : userAgent;
    }
}
