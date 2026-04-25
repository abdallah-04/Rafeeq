package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface HomeworkRepository extends JpaRepository<Homework, UUID> {
    long countByChildId(UUID childId);
    @Query("select h.child.id, count(h) from Homework h where h.child.id in :childIds group by h.child.id")
    List<Object[]> countByChildIds(@Param("childIds") List<UUID> childIds);
    List<Homework> findByChildId(UUID childId);
    List<Homework> findByChildIdOrderByDueDateAsc(UUID childId);
    List<Homework> findByTeacherId(UUID teacherId);
    List<Homework> findByTreeId(UUID treeId);
   
    List<Homework> findByChildIdAndStatus(UUID childId, String status);
}
