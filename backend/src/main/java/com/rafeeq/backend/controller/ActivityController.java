package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.activity.ActivityResponse;
import com.rafeeq.backend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/children/{childId}")
    public ResponseEntity<List<ActivityResponse>> getActivities(
            @PathVariable UUID childId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication authentication
    ) {
        return ResponseEntity.ok(activityService.getActivities(childId, authentication.getName(), acceptLanguage));
    }

    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityResponse> getActivity(
            @PathVariable UUID activityId,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLanguage,
            Authentication authentication
    ) {
        return ResponseEntity.ok(activityService.getActivity(activityId, authentication.getName(), acceptLanguage));
    }
}
