package com.rafeeq.backend.dto.note;

import lombok.Data;

import java.util.UUID;

@Data
public class CreateNoteRequest {
    private UUID childId;
    private String title;
    private String content;
}