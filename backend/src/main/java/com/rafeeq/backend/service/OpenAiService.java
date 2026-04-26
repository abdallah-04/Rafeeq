package com.rafeeq.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rafeeq.backend.common.ServiceUnavailableException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OpenAiService {

    private static final String CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
     private static final String MODEL_NAME = "gpt-4o-mini";

    @Value("${openai.api.key:}")
    private String apiKey;

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

    public String getModelName() {
        return MODEL_NAME;
    }

    public String chat(List<Map<String, String>> messages, double temperature, int maxTokens) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ServiceUnavailableException("OpenAI is not configured locally. Set OPENAI_API_KEY to enable this feature.");
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL_NAME);
            requestBody.put("messages", messages);
            requestBody.put("temperature", temperature);
            requestBody.put("max_tokens", maxTokens);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CHAT_COMPLETIONS_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(90))
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ServiceUnavailableException("OpenAI request failed with status " + response.statusCode() + ".");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = objectMapper.readValue(response.body(), Map.class);
            List<?> choices = (List<?>) parsed.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new ServiceUnavailableException("OpenAI returned an empty response.");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> firstChoice = (Map<String, Object>) choices.get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            String content = message != null ? (String) message.get("content") : null;
            if (content == null || content.isBlank()) {
                throw new ServiceUnavailableException("OpenAI returned an empty response.");
            }

            return content.trim();
        } catch (ServiceUnavailableException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ServiceUnavailableException("OpenAI request could not be completed right now.");
        }
    }
}
