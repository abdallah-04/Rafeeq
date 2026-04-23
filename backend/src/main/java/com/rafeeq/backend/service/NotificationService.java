package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.notification.NotificationResponse;
import com.rafeeq.backend.entity.Notification;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.repository.NotificationRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public List<NotificationResponse> getMyNotifications(String nationalId) {

        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public MessageResponse markAsRead(UUID id, String nationalId) {

        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Notification n = notificationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new NotFoundException("Notification not found"));

        n.setIsRead(true);

        notificationRepository.save(n);

        return new MessageResponse(true, "Notification marked as read");
    }

    @Transactional
    public MessageResponse markAllAsRead(String nationalId) {

        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        List<Notification> list =
                notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        for (Notification n : list) {
            n.setIsRead(true);
        }

        notificationRepository.saveAll(list);

        return new MessageResponse(true, "All notifications marked as read");
    }

    private NotificationResponse map(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getTitleAr(),
                n.getBodyAr(),
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}
