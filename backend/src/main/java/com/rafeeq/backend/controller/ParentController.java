package com.rafeeq.backend.controller;

import com.rafeeq.backend.service.ParentChildService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/parent")
@RequiredArgsConstructor
public class ParentController {

    private final ParentChildService parentChildService;

    @GetMapping("/children")
    public ResponseEntity<?> getChildren(Authentication auth) {
        return ResponseEntity.ok(
                parentChildService.getAll(auth.getName())
        );
    }

    @GetMapping("/children/{id}")
    public ResponseEntity<?> getChild(
            @PathVariable UUID id,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                parentChildService.getOne(id, auth.getName())
        );
    }

    @GetMapping("/children/{id}/summary")
    public ResponseEntity<?> getChildSummary(
            @PathVariable UUID id,
            Authentication auth
    ) {
        return ResponseEntity.ok(
                parentChildService.getSummary(id, auth.getName())
        );
    }

    @DeleteMapping("/children/{id}")
    public ResponseEntity<?> unlinkChild(
            @PathVariable UUID id,
            Authentication auth
    ) {
        parentChildService.unlink(id, auth.getName());

        return ResponseEntity.ok(
                java.util.Map.of(
                        "success", true,
                        "message", "Child unlinked successfully"
                )
        );
    }
}