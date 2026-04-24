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
    List<ChildProfile> findByTeacherIdAndTeacherSchoolId(UUID teacherId, UUID schoolId);
    Optional<ChildProfile> findByIdAndTeacherId(UUID id, UUID teacherId);
    Optional<ChildProfile> findByIdAndTeacherSchoolId(UUID id, UUID schoolId);
    Optional<ChildProfile> findByIdAndParentId(UUID id, UUID parentId);
    long countByTeacherId(UUID teacherId);
    long countByParentId(UUID parentId);
    long countByTeacherSchoolId(UUID schoolId);
}
