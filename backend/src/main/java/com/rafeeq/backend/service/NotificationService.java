package com.rafeeq.backend.service;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.notification.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    public List<NotificationResponse> getMyNotifications(String nationalId) {
        return List.of(
                new NotificationResponse(
                        UUID.randomUUID(),
                        "New Homework",
                        "You have a new homework assigned.",
                        false,
                        LocalDateTime.now()
                ),
                new NotificationResponse(
                        UUID.randomUUID(),
                        "New Report",
                        "A new report has been added.",
                        true,
                        LocalDateTime.now().minusDays(1)
                )
        );
    }

    public MessageResponse markAsRead(UUID id, String nationalId) {
        return new MessageResponse(true, "Notification marked as read");
    }

    public MessageResponse markAllAsRead(String nationalId) {
        return new MessageResponse(true, "All notifications marked as read");
    }
}