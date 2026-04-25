package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.TreeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TreeItemRepository extends JpaRepository<TreeItem, UUID> {
    List<TreeItem> findByTreeIdOrderByOrderNumAsc(UUID treeId);
    List<TreeItem> findByTreeIdAndStatus(UUID treeId, String status);
    Optional<TreeItem> findFirstByItemId(UUID itemId);

    @Query("""
            select ti.tree.child.id,
                   count(ti),
                   sum(case when ti.isCompleted = true then 1 else 0 end)
            from TreeItem ti
            where ti.tree.child.id in :childIds
              and ti.tree.status in ('active', 'completed')
            group by ti.tree.child.id
            """)
    List<Object[]> countProgressByChildIds(@Param("childIds") List<UUID> childIds);
}
