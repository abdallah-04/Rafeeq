package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    List<Activity> findByChildId(UUID childId);
    List<Activity> findByTreeId(UUID treeId);
    List<Activity> findByChildIdAndStatus(UUID childId, String status);
}