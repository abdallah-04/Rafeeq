package com.rafeeq.backend.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlacementAssessmentResponse {
    private UUID childId;
    private String childName;
    private String childStatus;
    private boolean placementCompleted;
    private List<PlacementQuestionResponse> questions;
}
