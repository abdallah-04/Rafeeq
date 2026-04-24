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

    private final HttpClient httpClient = HttpClient.newBuilder()
    .connectTimeout(java.time.Duration.ofSeconds(30))
    .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateLearningTree(String childName, int age,
                                       String topicNameAr, String topicNameEn,
                                       int level) throws Exception {

        String prompt = buildPrompt(childName, age, topicNameAr, topicNameEn, level);

        Map<String, Object> requestBody = Map.of(
            "model", "gpt-4o-mini",
            "messages", List.of(
                Map.of("role", "system", "content",
                    "You are an expert bilingual educational content creator for children aged 4-7. " +
                    "Always respond with valid complete JSON only. " +
                    "No extra text, no markdown, no backticks. " +
                    "NEVER stop writing in the middle of JSON."),
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
    .timeout(java.time.Duration.ofSeconds(60))
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
        String content = (String) message.get("content");

        if (content == null || content.isBlank()) {
            throw new RuntimeException("OpenAI returned empty response!");
        }

        if (!content.trim().endsWith("}")) {
            throw new RuntimeException(
                "OpenAI JSON was cut off! Try increasing max_tokens. " +
                "Response ended with: ..." + 
                content.substring(Math.max(0, content.length() - 50))
            );
        }

        return content;
    }

       private String buildPrompt(String childName, int age,
                            String topicNameAr, String topicNameEn,int level) {
    return """
        You are creating a learning tree for a child.
        Child name: %s, Age: %d, Level: %d
        Topic in Arabic: %s
        Topic in English: %s

        IMPORTANT RULES:
        - Return ONLY valid JSON
        - No markdown, no backticks, no extra text
        - Keep text SHORT and SIMPLE for children
        - Every question MUST have an emoji

        Return this exact JSON structure:
        {
          "summary_ar": "وصف قصير للمستوى بالعربي",
          "summary_en": "Short level description in English",
          "groups": [
            {
              "group_number": 1,
              "activity": {
                "title_ar": "عنوان النشاط",
                "title_en": "Activity title",
                "description_ar": "وصف النشاط",
                "description_en": "Activity description",
                "activity_task_ar": "مهمة النشاط",
                "activity_task_en": "Activity task",
                "parent_guide_ar": "دليل الوالدين",
                "parent_guide_en": "Parent guide"
              },
              "homework": {
                "title_ar": "عنوان الواجب",
                "title_en": "Homework title",
                "description_ar": "وصف الواجب",
                "description_en": "Homework description"
              },
              "quiz": {
                "questions": [
                  {
                    "question_ar": "السؤال بالعربي 🎯",
                    "question_en": "Question in English 🎯",
                    "option_1_ar": "خيار 1", "option_1": "Option 1",
                    "option_2_ar": "خيار 2", "option_2": "Option 2",
                    "option_3_ar": "خيار 3", "option_3": "Option 3",
                    "option_4_ar": "خيار 4", "option_4": "Option 4",
                    "correct_option": 1,
                    "explanation_ar": "التفسير",
                    "explanation_en": "Explanation"
                  },
                  {
                    "question_ar": "السؤال بالعربي 🎯",
                    "question_en": "Question in English 🎯",
                    "option_1_ar": "خيار 1", "option_1": "Option 1",
                    "option_2_ar": "خيار 2", "option_2": "Option 2",
                    "option_3_ar": "خيار 3", "option_3": "Option 3",
                    "option_4_ar": "خيار 4", "option_4": "Option 4",
                    "correct_option": 2,
                    "explanation_ar": "التفسير",
                    "explanation_en": "Explanation"
                  },
                  {
                    "question_ar": "السؤال بالعربي 🎯",
                    "question_en": "Question in English 🎯",
                    "option_1_ar": "خيار 1", "option_1": "Option 1",
                    "option_2_ar": "خيار 2", "option_2": "Option 2",
                    "option_3_ar": "خيار 3", "option_3": "Option 3",
                    "option_4_ar": "خيار 4", "option_4": "Option 4",
                    "correct_option": 3,
                    "explanation_ar": "التفسير",
                    "explanation_en": "Explanation"
                  }
                ]
              }
            },
            {
              "group_number": 2,
              "activity": {
                "title_ar": "...", "title_en": "...",
                "description_ar": "...", "description_en": "...",
                "activity_task_ar": "...", "activity_task_en": "...",
                "parent_guide_ar": "...", "parent_guide_en": "..."
              },
              "homework": {
                "title_ar": "...", "title_en": "...",
                "description_ar": "...", "description_en": "..."
              },
              "quiz": {
                "questions": [
                  {
                    "question_ar": "...🎯", "question_en": "...🎯",
                    "option_1_ar": "...", "option_1": "...",
                    "option_2_ar": "...", "option_2": "...",
                    "option_3_ar": "...", "option_3": "...",
                    "option_4_ar": "...", "option_4": "...",
                    "correct_option": 1,
                    "explanation_ar": "...", "explanation_en": "..."
                  },
                  {
                    "question_ar": "...🎯", "question_en": "...🎯",
                    "option_1_ar": "...", "option_1": "...",
                    "option_2_ar": "...", "option_2": "...",
                    "option_3_ar": "...", "option_3": "...",
                    "option_4_ar": "...", "option_4": "...",
                    "correct_option": 2,
                    "explanation_ar": "...", "explanation_en": "..."
                  },
                  {
                    "question_ar": "...🎯", "question_en": "...🎯",
                    "option_1_ar": "...", "option_1": "...",
                    "option_2_ar": "...", "option_2": "...",
                    "option_3_ar": "...", "option_3": "...",
                    "option_4_ar": "...", "option_4": "...",
                    "correct_option": 3,
                    "explanation_ar": "...", "explanation_en": "..."
                  }
                ]
              }
            },
            {
              "group_number": 3,
              "activity": {
                "title_ar": "...", "title_en": "...",
                "description_ar": "...", "description_en": "...",
                "activity_task_ar": "...", "activity_task_en": "...",
                "parent_guide_ar": "...", "parent_guide_en": "..."
              },
              "homework": {
                "title_ar": "...", "title_en": "...",
                "description_ar": "...", "description_en": "..."
              },
              "quiz": {
                "questions": [
                  {
                    "question_ar": "...🎯", "question_en": "...🎯",
                    "option_1_ar": "...", "option_1": "...",
                    "option_2_ar": "...", "option_2": "...",
                    "option_3_ar": "...", "option_3": "...",
                    "option_4_ar": "...", "option_4": "...",
                    "correct_option": 1,
                    "explanation_ar": "...", "explanation_en": "..."
                  },
                  {
                    "question_ar": "...🎯", "question_en": "...🎯",
                    "option_1_ar": "...", "option_1": "...",
                    "option_2_ar": "...", "option_2": "...",
                    "option_3_ar": "...", "option_3": "...",
                    "option_4_ar": "...", "option_4": "...",
                    "correct_option": 2,
                    "explanation_ar": "...", "explanation_en": "..."
                  },
                  {
                    "question_ar": "...🎯", "question_en": "...🎯",
                    "option_1_ar": "...", "option_1": "...",
                    "option_2_ar": "...", "option_2": "...",
                    "option_3_ar": "...", "option_3": "...",
                    "option_4_ar": "...", "option_4": "...",
                    "correct_option": 3,
                    "explanation_ar": "...", "explanation_en": "..."
                  }
                ]
              }
            }
          ],
          "final_exam": {
            "questions": [
              {
                "question_ar": "...🎯", "question_en": "...🎯",
                "option_1_ar": "...", "option_1": "...",
                "option_2_ar": "...", "option_2": "...",
                "option_3_ar": "...", "option_3": "...",
                "option_4_ar": "...", "option_4": "...",
                "correct_option": 1,
                "explanation_ar": "...", "explanation_en": "..."
              },
              {
                "question_ar": "...🎯", "question_en": "...🎯",
                "option_1_ar": "...", "option_1": "...",
                "option_2_ar": "...", "option_2": "...",
                "option_3_ar": "...", "option_3": "...",
                "option_4_ar": "...", "option_4": "...",
                "correct_option": 2,
                "explanation_ar": "...", "explanation_en": "..."
              },
              {
                "question_ar": "...🎯", "question_en": "...🎯",
                "option_1_ar": "...", "option_1": "...",
                "option_2_ar": "...", "option_2": "...",
                "option_3_ar": "...", "option_3": "...",
                "option_4_ar": "...", "option_4": "...",
                "correct_option": 3,
                "explanation_ar": "...", "explanation_en": "..."
              },
              {
                "question_ar": "...🎯", "question_en": "...🎯",
                "option_1_ar": "...", "option_1": "...",
                "option_2_ar": "...", "option_2": "...",
                "option_3_ar": "...", "option_3": "...",
                "option_4_ar": "...", "option_4": "...",
                "correct_option": 1,
                "explanation_ar": "...", "explanation_en": "..."
              },
              {
                "question_ar": "...🎯", "question_en": "...🎯",
                "option_1_ar": "...", "option_1": "...",
                "option_2_ar": "...", "option_2": "...",
                "option_3_ar": "...", "option_3": "...",
                "option_4_ar": "...", "option_4": "...",
                "correct_option": 2,
                "explanation_ar": "...", "explanation_en": "..."
              }
            ]
          }
        }
        """.formatted(childName, age, level, topicNameAr, topicNameEn);
}
    }
