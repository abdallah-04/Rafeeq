package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ActivityRepository extends JpaRepository<Activity, UUID> {
    long countByChildId(UUID childId);
    @Query("select a.child.id, count(a) from Activity a where a.child.id in :childIds group by a.child.id")
    List<Object[]> countByChildIds(@Param("childIds") List<UUID> childIds);
    List<Activity> findByChildId(UUID childId);
    List<Activity> findByTreeId(UUID treeId);
    List<Activity> findByChildIdAndStatus(UUID childId, String status);

    @Query("""
            select a
            from Activity a
            where a.child.id = :childId
              and (
                a.tree.id = :treeId
                or a.treeItemId in (
                  select ti.id
                  from TreeItem ti
                  where ti.tree.id = :treeId
                )
              )
            """)
    List<Activity> findByChildIdAndTreeId(
            @Param("childId") UUID childId,
            @Param("treeId") UUID treeId
    );
}
