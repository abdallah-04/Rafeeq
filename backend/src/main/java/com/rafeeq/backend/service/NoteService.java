package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.note.CreateNoteRequest;
import com.rafeeq.backend.dto.note.NoteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService {

    public NoteResponse addTeacherNote(CreateNoteRequest request, String nationalId) {
        return new NoteResponse(
                UUID.randomUUID(),
                request.getChildId(),
                request.getTitle(),
                request.getContent(),
                "TEACHER",
                LocalDateTime.now()
        );
    }

    public List<NoteResponse> getTeacherNotes(UUID childId, String nationalId) {
        return List.of(
                new NoteResponse(
                        UUID.randomUUID(),
                        childId,
                        "Daily Progress",
                        "Student did very well today.",
                        "TEACHER",
                        LocalDateTime.now()
                )
        );
    }

    public List<NoteResponse> getParentNotes(UUID childId, String nationalId) {
        return List.of(
                new NoteResponse(
                        UUID.randomUUID(),
                        childId,
                        "Daily Progress",
                        "Student did very well today.",
                        "TEACHER",
                        LocalDateTime.now()
                )
        );
    }
}