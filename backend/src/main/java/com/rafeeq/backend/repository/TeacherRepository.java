package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
    Optional<Teacher> findByUserId(UUID userId);
    List<Teacher> findBySchoolId(UUID schoolId);
    long countBySchoolId(UUID schoolId);
}