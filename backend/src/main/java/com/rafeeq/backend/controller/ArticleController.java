package com.rafeeq.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    @GetMapping
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(java.util.List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable Long id) {
        return ResponseEntity.ok(java.util.Map.of("id", id));
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<?> save(@PathVariable Long id) {
        return ResponseEntity.ok(
                java.util.Map.of(
                        "success", true,
                        "message", "Article saved"
                )
        );
    }

    @DeleteMapping("/{id}/save")
    public ResponseEntity<?> unsave(@PathVariable Long id) {
        return ResponseEntity.ok(
                java.util.Map.of(
                        "success", true,
                        "message", "Article unsaved"
                )
        );
    }
}