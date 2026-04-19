package com.rafeeq.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ParentChildService {

    public Object getAll(String nationalId) {
        return List.of(
                Map.of(
                        "id", UUID.randomUUID(),
                        "name", "Ayoub Maher",
                        "level", "LEVEL_3",
                        "progress", 62
                ),
                Map.of(
                        "id", UUID.randomUUID(),
                        "name", "Mona Ramzi",
                        "level", "LEVEL_5",
                        "progress", 74
                )
        );
    }

    public Object getOne(UUID id, String nationalId) {
        return Map.of(
                "id", id,
                "name", "Ayoub Maher",
                "age", 8,
                "level", "LEVEL_3",
                "progress", 62
        );
    }

    public Object getSummary(UUID id, String nationalId) {
        return Map.of(
                "childId", id,
                "tasksCompleted", 8,
                "daysInRow", 14,
                "achievements", 3,
                "progress", 62
        );
    }

    public void unlink(UUID id, String nationalId) {
    }
}