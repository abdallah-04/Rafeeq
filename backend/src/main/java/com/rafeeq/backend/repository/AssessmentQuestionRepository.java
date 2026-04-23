package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.AssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion, UUID> {
    List<AssessmentQuestion> findByLevelOrderByOrderNumAsc(Integer level);
    List<AssessmentQuestion> findAllByOrderByLevelAscOrderNumAsc();
}
