package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    List<Subject> findAllByOrderByIdAsc();
}
