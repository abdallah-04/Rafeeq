package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.ChildAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChildAssessmentRepository extends JpaRepository<ChildAssessment, UUID> {
    List<ChildAssessment> findByChildId(UUID childId);
    List<ChildAssessment> findByTeacherId(UUID teacherId);
    List<ChildAssessment> findByChildIdOrderByCreatedAtDesc(UUID childId);
}
