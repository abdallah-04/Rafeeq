package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SchoolRepository extends JpaRepository<School, UUID> {
    Optional<School> findByUserId(UUID userId);
}