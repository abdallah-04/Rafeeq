package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity_enums.ChildStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChildProfileRepository extends JpaRepository<ChildProfile, UUID> {
    Optional<ChildProfile> findByUserId(UUID userId);
    List<ChildProfile> findByParentId(UUID parentId);
    @Query("select c.id from ChildProfile c where c.parent.id = :parentId")
    List<UUID> findIdsByParentId(@Param("parentId") UUID parentId);
    @Query("select c.id from ChildProfile c where c.teacher.id = :teacherId")
    List<UUID> findIdsByTeacherId(@Param("teacherId") UUID teacherId);
    List<ChildProfile> findByTeacherId(UUID teacherId);
    List<ChildProfile> findByTeacherIdAndTeacherSchoolId(UUID teacherId, UUID schoolId);
    Optional<ChildProfile> findByIdAndTeacherId(UUID id, UUID teacherId);
    Optional<ChildProfile> findByIdAndTeacherSchoolId(UUID id, UUID schoolId);
    Optional<ChildProfile> findByIdAndParentId(UUID id, UUID parentId);
    long countByTeacherId(UUID teacherId);
    long countByTeacherIdAndStatus(UUID teacherId, ChildStatus status);
    long countByParentId(UUID parentId);
    long countByParentIdAndStatus(UUID parentId, ChildStatus status);
    long countByTeacherSchoolId(UUID schoolId);
    long countByTeacherSchoolIdAndStatusNot(UUID schoolId, ChildStatus status);
}
