package com.rafeeq.backend.dto.learning;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TreeItemResponse {
    private UUID id;
    private UUID treeId;
    private UUID itemId;
    private String itemType;
    private String title;
    private String description;
    private String status;
    private Integer orderNum;
    private Integer groupNumber;
    private Boolean locked;
    private Boolean completed;
    private Integer maxPoints;
    private Integer earnedPoints;
    private LocalDateTime completedAt;
}
