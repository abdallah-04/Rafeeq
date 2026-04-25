package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.chatbot.ChatbotMessageRequest;
import com.rafeeq.backend.dto.chatbot.ChatbotMessageResponse;
import com.rafeeq.backend.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ChatbotMessageResponse> sendMessage(
            @Valid @RequestBody ChatbotMessageRequest request,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                chatbotService.sendMessage(
                        authentication.getName(),
                        request.getMessage(),
                        request.getChildId(),
                        acceptLanguage
                )
        );
    }
}
