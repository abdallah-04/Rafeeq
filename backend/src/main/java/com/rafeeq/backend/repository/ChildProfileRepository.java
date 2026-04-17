package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.ChildProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChildProfileRepository extends JpaRepository<ChildProfile, UUID> {
    Optional<ChildProfile> findByUserId(UUID userId);
    List<ChildProfile> findByParentId(UUID parentId);
    List<ChildProfile> findByTeacherId(UUID teacherId);
}