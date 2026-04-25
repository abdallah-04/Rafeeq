package com.rafeeq.backend.dto.learning;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TreeItemCompletionResponse {
    private UUID treeId;
    private UUID itemId;
    private boolean treeCompleted;
    private int completedItems;
    private int totalItems;
    private int progressPercentage;
    private String treeStatus;
}
