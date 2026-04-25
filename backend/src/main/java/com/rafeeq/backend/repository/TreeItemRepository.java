package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.TreeItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TreeItemRepository extends JpaRepository<TreeItem, UUID> {
    List<TreeItem> findByTreeIdOrderByOrderNumAsc(UUID treeId);
    List<TreeItem> findByTreeIdAndStatus(UUID treeId, String status);
    Optional<TreeItem> findFirstByItemId(UUID itemId);
}
