package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    long countByChildId(UUID childId);
    List<Quiz> findByChildId(UUID childId);
    List<Quiz> findByChildIdAndStatus(UUID childId, String status);
    List<Quiz> findByTreeId(UUID treeId);
}
