package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Homework;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface HomeworkRepository extends JpaRepository<Homework, UUID> {
    List<Homework> findByChildId(UUID childId);
    List<Homework> findByChildIdOrderByDueDateAsc(UUID childId);
    List<Homework> findByTeacherId(UUID teacherId);
    List<Homework> findByTreeId(UUID treeId);
   
    List<Homework> findByChildIdAndStatus(UUID childId, String status);
}
