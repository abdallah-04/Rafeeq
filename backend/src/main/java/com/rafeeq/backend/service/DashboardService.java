package com.rafeeq.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    public Object parent(String nationalId) {
        return Map.of(
                "childrenCount", 2,
                "latestActivity", "Homework completed",
                "notificationsCount", 3,
                "progress", 74
        );
    }

    public Object teacher(String nationalId) {
        return Map.of(
                "studentsCount", 12,
                "classesCount", 3,
                "latestActivity", "New report added"
        );
    }

    public Object school(String nationalId) {
        return Map.of(
                "teachersCount", 8,
                "studentsCount", 96,
                "summary", "Everything running smoothly"
        );
    }
}