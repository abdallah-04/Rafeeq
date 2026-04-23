package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.child.LinkChildRequest;
import com.rafeeq.backend.service.ParentChildService;
import jakarta.validation.Valid;
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

    @PostMapping("/children/link")
    public ResponseEntity<MessageResponse> linkChild(
            @Valid @RequestBody LinkChildRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(parentChildService.link(request, auth.getName()));
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
    public ResponseEntity<MessageResponse> unlinkChild(
            @PathVariable UUID id,
            Authentication auth
    ) {
        return ResponseEntity.ok(parentChildService.unlink(id, auth.getName()));
    }
}
