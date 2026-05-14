package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    long countByChildId(UUID childId);
    @Query("select q.child.id, count(q) from Quiz q where q.child.id in :childIds group by q.child.id")
    List<Object[]> countByChildIds(@Param("childIds") List<UUID> childIds);
    List<Quiz> findByChildId(UUID childId);
    List<Quiz> findByChildIdAndStatus(UUID childId, String status);
    List<Quiz> findByTreeId(UUID treeId);

    @Query("""
            select q
            from Quiz q
            where q.child.id = :childId
              and (
                q.tree.id = :treeId
                or q.treeItemId in (
                  select ti.id
                  from TreeItem ti
                  where ti.tree.id = :treeId
                )
              )
            """)
    List<Quiz> findByChildIdAndTreeId(
            @Param("childId") UUID childId,
            @Param("treeId") UUID treeId
    );
}
