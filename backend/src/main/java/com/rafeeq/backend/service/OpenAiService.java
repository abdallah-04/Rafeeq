package com.rafeeq.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ═══════════════════════════════════════════
    // الدالة الرئيسية — بتبعث لـ OpenAI وبترجع JSON
    // ═══════════════════════════════════════════
    public String generateLearningTree(String childName, int age,
                                       String topicNameAr, String topicNameEn,
                                       int level) throws Exception {

        // 1. بنبني البرومبت
        String prompt = buildPrompt(childName, age, topicNameAr, topicNameEn, level);

        // 2. بنبني الطلب
        Map<String, Object> requestBody = Map.of(
            "model", "gpt-4o",
            "messages", List.of(
                Map.of("role", "system", "content",
                    "You are an expert bilingual educational content creator for children aged 4-7. " +
                    "Always respond with valid JSON only. No extra text, no markdown, no backticks."),
                Map.of("role", "user", "content", prompt)
            ),
            "temperature", 0.7,
            "max_tokens", 4000
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.openai.com/v1/chat/completions"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + apiKey)
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();

        HttpResponse<String> response = httpClient
            .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenAI Error: " + response.statusCode() 
                + " — " + response.body());
        }

        Map<?, ?> parsed = objectMapper.readValue(response.body(), Map.class);
        List<?> choices = (List<?>) parsed.get("choices");
        Map<?, ?> message = (Map<?, ?>) ((Map<?, ?>) choices.get(0)).get("message");
        return (String) message.get("content");
    }
    // buildPrompt 
    private String buildPrompt(String childName, int age,
                                String topicNameAr, String topicNameEn,
                                int level) {
        return """
            Child: %s, Age: %d, Level: %d
            Topic AR: %s
            Topic EN: %s

            Create a full learning tree with 3 groups + 1 final exam.
            Each group has: 1 activity, 1 homework, 1 quiz (3 questions, 4 options each).
            Final exam: 5 questions, 4 options each.
                Everything bilingual (AR + EN). JSON only, no extra text.
                IMPORTANT: Each quiz must have EXACTLY 5 questions, each question MUST include emojis in the text (e.g. "كم عدد التفاحات؟ 🍎🍎🍎", "How many apples? 🍎🍎🍎"). Never write a question without emojis!
           CRITICAL: Every single question_ar and question_en MUST contain emojis. 
            Examples:
            - "كم عدد التفاحات؟ 🍎🍎🍎" 
            - "أي صورة تساوي الرقم 3؟ 🌟🌟🌟"
            - "عدّ النجوم: ⭐⭐⭐⭐ كم عددها؟"
            Never write a question without emojis - this is mandatory!
            Required JSON format:
            {
              "groups": [
                {
                  "group_number": 1,
                  "sub_topic_ar": "...",
                  "sub_topic_en": "...",
                  "activity": {
                    "title_ar": "...",
                    "title_en": "...",
                    "description_ar": "...",
                    "description_en": "...",
                    "activity_task_ar": "...",
                    "activity_task_en": "...",
                    "parent_guide_ar": "...",
                    "parent_guide_en": "..."
                  },
                  "homework": {
                    "title_ar": "...",
                    "title_en": "...",
                    "description_ar": "...",
                    "description_en": "..."
                  },
                  "quiz": {
                    "questions": [
                      {
                        "question_ar": "...",
                        "question_en": "...",
                        "option_1_ar": "...", "option_1": "...",
                        "option_2_ar": "...", "option_2": "...",
                        "option_3_ar": "...", "option_3": "...",
                        "option_4_ar": "...", "option_4": "...",
                        "correct_option": 0,
                        "explanation_ar": "...",
                        "explanation_en": "..."
                      }
                    ]
                  }
                }
              ],
              "final_exam": {
                "questions": [
                  {
                    "question_ar": "...",
                    "question_en": "...",
                    "option_1_ar": "...", "option_1": "...",
                    "option_2_ar": "...", "option_2": "...",
                    "option_3_ar": "...", "option_3": "...",
                    "option_4_ar": "...", "option_4": "...",
                    "correct_option": 0,
                    "explanation_ar": "...",
                    "explanation_en": "..."
                  }
                ]
              }
            }
            """.formatted(childName, age, level, topicNameAr, topicNameEn);
    }
}