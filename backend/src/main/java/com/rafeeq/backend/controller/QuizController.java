package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.quiz.QuizResponse;
import com.rafeeq.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/children/{childId}")
    public ResponseEntity<List<QuizResponse>> getQuizzes(
            @PathVariable UUID childId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication authentication
    ) {
        return ResponseEntity.ok(quizService.getQuizzes(childId, authentication.getName(), acceptLanguage));
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<QuizResponse> getQuiz(
            @PathVariable UUID quizId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication authentication
    ) {
        return ResponseEntity.ok(quizService.getQuiz(quizId, authentication.getName(), acceptLanguage));
    }
}
