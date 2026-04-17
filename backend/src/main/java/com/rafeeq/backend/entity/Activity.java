package com.rafeeq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private ChildProfile child;

    @Column(name = "title_ar", length = 255)
    private String titleAr;

    @Column(name = "title_en", length = 255)
    private String titleEn;

    @Column(name = "description_ar", columnDefinition = "TEXT")
    private String descriptionAr;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "instructions_ar", columnDefinition = "TEXT")
    private String instructionsAr;

    @Column(name = "instructions_en", columnDefinition = "TEXT")
    private String instructionsEn;

    @Column(name = "materials_needed_ar", columnDefinition = "TEXT")
    private String materialsNeededAr;

    @Column(name = "materials_needed_en", columnDefinition = "TEXT")
    private String materialsNeededEn;

    @Column(name = "expected_outcome_ar", columnDefinition = "TEXT")
    private String expectedOutcomeAr;

    @Column(name = "expected_outcome_en", columnDefinition = "TEXT")
    private String expectedOutcomeEn;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tree_id")
    private LearningTree tree;

    @Column(name = "tree_item_id")
    private UUID treeItemId;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}