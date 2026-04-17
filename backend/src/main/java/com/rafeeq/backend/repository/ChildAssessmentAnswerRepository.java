package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.ChildAssessmentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChildAssessmentAnswerRepository extends JpaRepository<ChildAssessmentAnswer, UUID> {
    List<ChildAssessmentAnswer> findByAssessmentId(UUID assessmentId);
}