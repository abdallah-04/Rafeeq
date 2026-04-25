package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.LearningTree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LearningTreeRepository extends JpaRepository<LearningTree, UUID> {
    List<LearningTree> findByChildId(UUID childId);
    List<LearningTree> findByChildIdAndStatus(UUID childId, String status);
    Optional<LearningTree> findFirstByChildIdAndStatusOrderByGeneratedAtDesc(UUID childId, String status);
}
