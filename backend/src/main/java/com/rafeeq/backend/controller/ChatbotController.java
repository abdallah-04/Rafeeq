package com.rafeeq.backend.controller;

import com.rafeeq.backend.auth.JwtService;
import com.rafeeq.backend.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final JwtService jwtService;

    @PostMapping("/message")
    public Map<String, String> sendMessage(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body) throws Exception {

        String token = authHeader.replace("Bearer ", "");
        UUID userId = UUID.fromString(
            jwtService.extractClaim(token, claims -> claims.get("userId", String.class))
        );

        String userMessage = body.get("message");
        String childId = body.get("childId"); // ← جديد

        if (userMessage == null || userMessage.isBlank()) {
            throw new RuntimeException("Message cannot be empty");
        }

        String response = chatbotService.sendMessage(userId, userMessage, childId);

        return Map.of(
            "message", userMessage,
            "response", response
        );
    }
}