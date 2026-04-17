package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ParentRepository extends JpaRepository<Parent, UUID> {
    Optional<Parent> findByUserId(UUID userId);
}