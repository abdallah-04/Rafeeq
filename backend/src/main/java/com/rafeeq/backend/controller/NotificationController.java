package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.notification.NotificationResponse;
import com.rafeeq.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication auth) {
        return ResponseEntity.ok(
                notificationService.getMyNotifications(auth.getName())
        );
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<MessageResponse> markAsRead(
            @PathVariable UUID id,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                notificationService.markAsRead(id, auth.getName())
        );
    }

    @PostMapping("/read-all")
    public ResponseEntity<MessageResponse> markAllAsRead(Authentication auth) {
        return ResponseEntity.ok(
                notificationService.markAllAsRead(auth.getName())
        );
    }
}