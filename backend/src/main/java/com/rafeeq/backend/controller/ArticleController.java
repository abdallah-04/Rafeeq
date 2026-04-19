package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public ResponseEntity<?> list(Authentication authentication) {
        return ResponseEntity.ok(articleService.list(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(articleService.one(id, authentication.getName()));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<MessageResponse> save(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(articleService.save(id, authentication.getName()));
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<MessageResponse> unsave(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(articleService.unsave(id, authentication.getName()));
    }
}
