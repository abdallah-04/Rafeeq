package com.rafeeq.backend.dto.chatbot;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class ChatbotMessageRequest {
    @NotBlank(message = "Message is required")
    private String message;

    private UUID childId;
}
