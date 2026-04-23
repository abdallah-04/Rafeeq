package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.SavedArticle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SavedArticleRepository extends JpaRepository<SavedArticle, UUID> {
    List<SavedArticle> findByUserId(UUID userId);
    List<SavedArticle> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<SavedArticle> findByUserIdAndArticleId(UUID userId, UUID articleId);
}
