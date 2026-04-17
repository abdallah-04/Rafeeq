package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContentTypeRepository extends JpaRepository<ContentType, Integer> {
}