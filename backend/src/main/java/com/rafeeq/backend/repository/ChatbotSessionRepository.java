package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.ChatbotSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatbotSessionRepository extends JpaRepository<ChatbotSession, UUID> {
    List<ChatbotSession> findByUserId(UUID userId);
    Optional<ChatbotSession> findFirstByUserIdAndChildIdOrderByUpdatedAtDesc(UUID userId, UUID childId);
    Optional<ChatbotSession> findFirstByUserIdAndChildIsNullOrderByUpdatedAtDesc(UUID userId);
}
