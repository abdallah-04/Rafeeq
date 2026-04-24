package com.rafeeq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "learning_trees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LearningTree {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private ChildProfile child;

    @Column(name = "level")
    private Integer level;

    @Column(name = "topic", length = 255)
    private String topic;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic_ref;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "ai_summary_ar", columnDefinition = "TEXT")
    private String aiSummaryAr;

    @Column(name = "ai_summary_en", columnDefinition = "TEXT")
    private String aiSummaryEn;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "model_used", length = 100)
    private String modelUsed;

    @Column(name = "prompt_version", length = 50)
    private String promptVersion;

    @JsonIgnore
    @OneToMany(mappedBy = "tree", fetch = FetchType.LAZY)
    private List<Quiz> quizzes = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "tree", fetch = FetchType.LAZY)
    private List<Homework> homeworks = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "tree", fetch = FetchType.LAZY)
    private List<Activity> activities = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "tree", fetch = FetchType.LAZY)
    private List<TreeItem> treeItems = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "tree", fetch = FetchType.LAZY)
    private List<ChildScore> childScores = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "tree", fetch = FetchType.LAZY)
    private List<ChildScoreLog> childScoreLogs = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }
    }
}