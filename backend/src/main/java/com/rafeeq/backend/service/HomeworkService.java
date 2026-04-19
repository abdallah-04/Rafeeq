package com.rafeeq.backend.service;

import com.rafeeq.backend.dto.homework.CreateHomeworkRequest;
import com.rafeeq.backend.dto.homework.HomeworkResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HomeworkService {

    public HomeworkResponse addTeacherHomework(CreateHomeworkRequest request, String nationalId) {
        return new HomeworkResponse(
                UUID.randomUUID(),
                request.getChildId(),
                request.getTitle(),
                request.getDescription(),
                request.getDueDate(),
                "ASSIGNED",
                "TEACHER",
                LocalDateTime.now()
        );
    }

    public List<HomeworkResponse> getTeacherHomework(UUID childId, String nationalId) {
        return List.of(
                new HomeworkResponse(
                        UUID.randomUUID(),
                        childId,
                        "Math Homework",
                        "Solve pages 12 and 13",
                        java.time.LocalDate.now().plusDays(2),
                        "ASSIGNED",
                        "TEACHER",
                        LocalDateTime.now()
                )
        );
    }

    public List<HomeworkResponse> getParentHomework(UUID childId, String nationalId) {
        return List.of(
                new HomeworkResponse(
                        UUID.randomUUID(),
                        childId,
                        "Math Homework",
                        "Solve pages 12 and 13",
                        java.time.LocalDate.now().plusDays(2),
                        "ASSIGNED",
                        "TEACHER",
                        LocalDateTime.now()
                )
        );
    }
}