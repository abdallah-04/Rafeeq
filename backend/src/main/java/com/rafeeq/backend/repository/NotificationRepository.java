package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    long countByUserIdAndIsRead(UUID userId, Boolean isRead);
    List<Notification> findByUserId(UUID userId);
    List<Notification> findByUserIdAndIsRead(UUID userId, Boolean isRead);
    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);
}
