package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.ChatbotMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatbotMessageRepository extends JpaRepository<ChatbotMessage, UUID> {
    List<ChatbotMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
    List<ChatbotMessage> findTop12BySessionIdOrderByCreatedAtDesc(UUID sessionId);
}
