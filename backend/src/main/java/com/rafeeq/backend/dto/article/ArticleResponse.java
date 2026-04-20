package com.rafeeq.backend.dto.article;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleResponse {
    private UUID id;
    private String titleAr;
    private String titleEn;
    private String contentAr;
    private String contentEn;
    private String imageUrl;
    private List<String> tags;
    private boolean saved;
}
