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

    @Query("""
            select h
            from Homework h
            where h.child.id = :childId
              and (h.treeItemId is not null or h.tree is not null)
            order by
              case when h.orderNum is null then 1 else 0 end,
              h.orderNum asc,
              h.dueDate asc
            """)
    List<Homework> findAiTreeByChildId(@Param("childId") UUID childId);

    @Query("""
            select h
            from Homework h
            where h.child.id = :childId
              and (
                h.tree.id = :treeId
                or h.treeItemId in (
                  select ti.id
                  from TreeItem ti
                  where ti.tree.id = :treeId
                )
              )
            order by
              case when h.orderNum is null then 1 else 0 end,
              h.orderNum asc,
              h.dueDate asc
            """)
    List<Homework> findAiTreeByChildIdAndTreeId(
            @Param("childId") UUID childId,
            @Param("treeId") UUID treeId
    );

    @Query("""
            select h
            from Homework h
            where h.child.id = :childId
              and h.treeItemId is null
              and h.tree is null
            order by h.dueDate asc
            """)
    List<Homework> findTeacherCreatedByChildId(@Param("childId") UUID childId);
}
