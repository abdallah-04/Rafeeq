package com.rafeeq.backend.dto.chatbot;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotMessageResponse {
    private UUID sessionId;
    private UUID childId;
    private String userMessage;
    private String assistantResponse;
    private LocalDateTime createdAt;
}
