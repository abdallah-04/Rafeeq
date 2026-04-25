package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.learning.GenerateLearningTreeRequest;
import com.rafeeq.backend.dto.learning.LearningTreeResponse;
import com.rafeeq.backend.dto.learning.TreeItemCompletionResponse;
import com.rafeeq.backend.dto.learning.TreeItemResponse;
import com.rafeeq.backend.service.LearningTreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tree")
@RequiredArgsConstructor
public class LearningTreeController {

    private final LearningTreeService learningTreeService;

    @GetMapping("/children/{childId}")
    public ResponseEntity<LearningTreeResponse> getActiveTree(
            @PathVariable UUID childId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication authentication
    ) {
        return ResponseEntity.ok(learningTreeService.getActiveTree(childId, authentication.getName(), acceptLanguage));
    }

    @PostMapping("/children/{childId}/generate")
    public ResponseEntity<LearningTreeResponse> generateTree(
            @PathVariable UUID childId,
            @RequestBody(required = false) GenerateLearningTreeRequest request,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                learningTreeService.generateTree(
                        childId,
                        request != null ? request.getTopicId() : null,
                        authentication.getName(),
                        acceptLanguage
                )
        );
    }

    @GetMapping("/children/{childId}/items")
    public ResponseEntity<List<TreeItemResponse>> getTreeItems(
            @PathVariable UUID childId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication authentication
    ) {
        return ResponseEntity.ok(learningTreeService.getTreeItems(childId, authentication.getName(), acceptLanguage));
    }

    @PatchMapping("/items/{itemId}/complete")
    public ResponseEntity<TreeItemCompletionResponse> completeItem(
            @PathVariable UUID itemId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(learningTreeService.completeItem(itemId, authentication.getName()));
    }
}
