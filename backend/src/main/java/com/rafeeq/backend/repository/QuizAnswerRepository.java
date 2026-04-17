package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.QuizAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, UUID> {
    List<QuizAnswer> findByQuizId(UUID quizId);
    List<QuizAnswer> findByQuestionId(UUID questionId);
}