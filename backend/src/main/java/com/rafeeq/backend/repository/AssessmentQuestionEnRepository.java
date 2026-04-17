package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.AssessmentQuestionEn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AssessmentQuestionEnRepository extends JpaRepository<AssessmentQuestionEn, UUID> {
    Optional<AssessmentQuestionEn> findByQuestionId(UUID questionId);
}