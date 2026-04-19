package com.rafeeq.backend.dto.assessment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlacementQuestionResponse {
    private UUID id;
    private Integer orderNum;
    private Integer level;
    private Integer points;
    private String questionAr;
    private String questionEn;
    private List<String> optionsAr;
    private List<String> optionsEn;
}
