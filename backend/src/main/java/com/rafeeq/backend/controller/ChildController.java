package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.child.ChildResponse;
import com.rafeeq.backend.dto.child.ChildSummaryResponse;
import com.rafeeq.backend.dto.child.CreateChildRequest;
import com.rafeeq.backend.dto.child.LinkChildRequest;
import com.rafeeq.backend.dto.child.UpdateChildRequest;
import com.rafeeq.backend.service.ChildService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/children")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ChildController {

    private final ChildService childService;

    @GetMapping("/my")
    public ResponseEntity<List<ChildResponse>> getMyChildren(Authentication authentication) {
        return ResponseEntity.ok(childService.getMyChildren(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChildResponse> getChildById(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(childService.getChildById(id, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChildResponse> updateChild(
            @PathVariable UUID id,
            @RequestBody UpdateChildRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(childService.updateChild(id, request, authentication.getName()));
    }

        @PostMapping("/link")
        public ResponseEntity<MessageResponse> linkChild(
                @RequestBody LinkChildRequest request,
                Authentication authentication
        ) {
            return ResponseEntity.ok(childService.linkChildByNationalId(request, authentication.getName()));
        }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteChild(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(childService.deleteChild(id, authentication.getName()));
    }

    @GetMapping("/{id}/summary")
    public ResponseEntity<ChildSummaryResponse> getChildSummary(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(childService.getChildSummary(id, authentication.getName()));
    }
}