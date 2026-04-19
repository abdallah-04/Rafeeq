package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByChildId(UUID childId);
    List<Report> findByChildIdOrderByCreatedAtDesc(UUID childId);
}
