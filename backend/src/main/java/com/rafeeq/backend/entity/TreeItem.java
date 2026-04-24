package com.rafeeq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tree_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TreeItem {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tree_id", nullable = false)
    private LearningTree tree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_type_id")
    private ContentType contentType;

    @Column(name = "item_id")
    private UUID itemId;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "order_num")
    private Integer orderNum;
    
    @Column(name = "is_locked")
    private Boolean isLocked = true;

    @Column(name = "is_completed")
    private Boolean isCompleted = false;

    @Column(name = "group_number")
    private Integer groupNumber;

    @Column(name = "item_type", length = 20)
    private String itemType;

    @Column(name = "max_points")
    private Integer maxPoints;

    @Column(name = "earned_points")
    private Integer earnedPoints;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}