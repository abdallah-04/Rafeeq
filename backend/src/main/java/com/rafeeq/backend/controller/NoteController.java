package com.rafeeq.backend.controller;

import com.rafeeq.backend.dto.note.CreateNoteRequest;
import com.rafeeq.backend.dto.note.NoteResponse;
import com.rafeeq.backend.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @PostMapping
    public ResponseEntity<NoteResponse> addTeacherNote(
            @RequestBody CreateNoteRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(noteService.addTeacherNote(request, auth.getName()));
    }

    @GetMapping("/teacher/{childId}")
    public ResponseEntity<List<NoteResponse>> getTeacherNotes(
            @PathVariable UUID childId,
            Authentication auth
    ) {
        return ResponseEntity.ok(noteService.getTeacherNotes(childId, auth.getName()));
    }

    @GetMapping("/parent/{childId}")
    public ResponseEntity<List<NoteResponse>> getParentNotes(
            @PathVariable UUID childId,
            Authentication auth
    ) {
        return ResponseEntity.ok(noteService.getParentNotes(childId, auth.getName()));
    }
}