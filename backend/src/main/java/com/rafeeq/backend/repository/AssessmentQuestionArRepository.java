package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.AssessmentQuestionAr;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AssessmentQuestionArRepository extends JpaRepository<AssessmentQuestionAr, UUID> {
    Optional<AssessmentQuestionAr> findByQuestionId(UUID questionId);
}