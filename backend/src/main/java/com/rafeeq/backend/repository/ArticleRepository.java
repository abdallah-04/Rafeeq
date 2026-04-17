package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {
}