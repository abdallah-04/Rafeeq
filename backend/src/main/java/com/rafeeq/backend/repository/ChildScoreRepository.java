package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.ChildScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChildScoreRepository extends JpaRepository<ChildScore, UUID> {
    List<ChildScore> findByChildId(UUID childId);
    Optional<ChildScore> findByChildIdAndTreeId(UUID childId, UUID treeId);
}