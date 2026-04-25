package com.rafeeq.backend.dto.learning;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LearningTreeResponse {
    private UUID id;
    private UUID childId;
    private Integer level;
    private String topic;
    private UUID topicId;
    private String summary;
    private String status;
    private LocalDateTime generatedAt;
}
