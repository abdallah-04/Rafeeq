package com.rafeeq.backend.dto.learning;

import lombok.Data;

import java.util.UUID;

@Data
public class GenerateLearningTreeRequest {
    private UUID topicId;
}
