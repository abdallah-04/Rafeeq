package com.rafeeq.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rafeeq.backend.entity.*;
import com.rafeeq.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ChatbotService {

    private final ChatbotSessionRepository sessionRepository;
    private final ChatbotMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChildProfileRepository childProfileRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${openai.api.key}")
    private String apiKey;

    private static final int MAX_HISTORY = 10;

    private static final String SYSTEM_PROMPT =
        "You are Rafeeq (رفيق), a warm AI assistant in the Rafeeq app " +
        "for children with learning difficulties in Jordan. " +
        "Learning difficulties include: Dyslexia, ADHD, Autism, " +
        "Speech Delay, and Developmental Delay. " +
        "You ONLY answer questions about: learning difficulties, " +
        "the Rafeeq app, and parenting advice. " +
        "You are NOT a doctor — never diagnose or suggest medication. " +
        "IMPORTANT: Always reply in the EXACT same language as the user's message. " +
        "If the user writes in English → reply in English. " +
        "If the user writes in Arabic → reply in Arabic. " +
        "Be kind, brief, and practical. " +
        "Keep responses SHORT — maximum 3 points or 4 lines. " +
        "Be concise and direct. " +
        "If asked who you are: say you are Rafeeq, the smart assistant inside the app. " +
        "Never reveal you are powered by OpenAI.";

 
    public String sendMessage(UUID userId, String userMessage, String childId) throws Exception {

        ChatbotSession session = getOrCreateSession(userId);

        saveMessage(session, "user", userMessage);

        List<ChatbotMessage> history = messageRepository
            .findBySessionIdOrderByCreatedAtAsc(session.getId());

        if (history.size() > MAX_HISTORY) {
            history = history.subList(history.size() - MAX_HISTORY, history.size());
        }

        List<Map<String, String>> messages = new ArrayList<>();

        // System prompt + child context
        String fullPrompt = SYSTEM_PROMPT;
        if (childId != null && !childId.isBlank()) {
            fullPrompt += " " + buildChildContext(childId);
        }
        messages.add(Map.of("role", "system", "content", fullPrompt));

        for (ChatbotMessage msg : history) {
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }

        String aiResponse = callOpenAi(messages);

        saveMessage(session, "assistant", aiResponse);

        session.setMessageCount(session.getMessageCount() + 2);
        session.setLastMessageAt(java.time.LocalDateTime.now());
        sessionRepository.save(session);

        return aiResponse;
    }

    private String buildChildContext(String childId) {
        try {
            ChildProfile child = childProfileRepository
                .findById(UUID.fromString(childId))
                .orElse(null);

            if (child == null) return "";

            int age = 5;
            if (child.getDateOfBirth() != null) {
                age = java.time.Period.between(
                    child.getDateOfBirth(),
                    java.time.LocalDate.now()
                ).getYears();
            }

            return "You are currently helping with this specific child: " +
                "Name: " + (child.getFullNameAr() != null ? child.getFullNameAr() : "Unknown") + ", " +
                "Age: " + age + " years, " +
                "Learning difficulty: " + (child.getLearningDifficulty() != null ? child.getLearningDifficulty() : "Unknown") + ", " +
                "Current level: " + (child.getLevel() != null ? child.getLevel() : 1) + ". " +
                "Provide advice specific to this child's needs.";
        } catch (Exception e) {
            return "";
        }
    }

    private ChatbotSession getOrCreateSession(UUID userId) {
        List<ChatbotSession> sessions = sessionRepository.findByUserId(userId);

        if (!sessions.isEmpty()) {
            return sessions.get(sessions.size() - 1);
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        ChatbotSession session = new ChatbotSession();
        session.setUser(user);
        session.setModelUsed("gpt-4o-mini");
        return sessionRepository.save(session);
    }

    private void saveMessage(ChatbotSession session, String role, String content) {
        ChatbotMessage message = new ChatbotMessage();
        message.setSession(session);
        message.setRole(role);
        message.setContent(content);
        messageRepository.save(message);
    }

    private String callOpenAi(List<Map<String, String>> messages) throws Exception {
        Map<String, Object> requestBody = Map.of(
            "model", "gpt-4o",
            "messages", messages,
            "max_tokens", 300,
            "temperature", 0.7
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.openai.com/v1/chat/completions"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .timeout(Duration.ofSeconds(60))
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();

        HttpResponse<String> response = client
            .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenAI Error: " + response.body());
        }

        var parsed = objectMapper.readValue(response.body(), Map.class);
        var choices = (List<?>) parsed.get("choices");
        var message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
        return (String) message.get("content");
    }
}