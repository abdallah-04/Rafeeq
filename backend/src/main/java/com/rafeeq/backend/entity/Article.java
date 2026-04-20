package com.rafeeq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Article {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "title_ar", length = 255)
    private String titleAr;

    @Column(name = "title_en", length = 255)
    private String titleEn;

    @Column(name = "content_ar", columnDefinition = "TEXT")
    private String contentAr;

    @Column(name = "content_en", columnDefinition = "TEXT")
    private String contentEn;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    /**
     * Comma-separated category tags, e.g. "Speech,Learning"
     * Stored as VARCHAR(255) — use getTags() / setTagsList() helpers.
     */
    @Column(name = "tags", length = 255)
    private String tags;

    @OneToMany(mappedBy = "article", fetch = FetchType.LAZY)
    private List<SavedArticle> savedArticles = new ArrayList<>();

    /** Returns tags as a List<String>. Never null. */
    public List<String> getTagsList() {
        if (tags == null || tags.isBlank()) return List.of();
        return Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /** Sets tags from a List<String>. */
    public void setTagsList(List<String> tagList) {
        this.tags = tagList == null ? null : String.join(",", tagList);
    }

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}
