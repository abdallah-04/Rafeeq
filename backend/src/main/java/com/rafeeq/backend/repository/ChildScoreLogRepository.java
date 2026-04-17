package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.ChildScoreLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChildScoreLogRepository extends JpaRepository<ChildScoreLog, UUID> {
    List<ChildScoreLog> findByChildId(UUID childId);
    List<ChildScoreLog> findByTreeId(UUID treeId);
    List<ChildScoreLog> findByChildIdAndTreeId(UUID childId, UUID treeId);
}