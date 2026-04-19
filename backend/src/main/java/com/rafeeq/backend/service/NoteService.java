package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.note.CreateNoteRequest;
import com.rafeeq.backend.dto.note.NoteResponse;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Note;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.NoteRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final ChildProfileRepository childProfileRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    public NoteResponse addTeacherNote(CreateNoteRequest request, String nationalId) {

        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        ChildProfile child = childProfileRepository.findById(request.getChildId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        Note note = new Note();
        note.setTeacher(teacher);
        note.setChild(child);
        note.setTitle(request.getTitle());
        note.setContent(request.getContent());

        noteRepository.save(note);

        return map(note);
    }

    public List<NoteResponse> getTeacherNotes(UUID childId, String nationalId) {
        return noteRepository.findByChildId(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    public List<NoteResponse> getParentNotes(UUID childId, String nationalId) {
        return noteRepository.findByChildId(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    private NoteResponse map(Note note) {
        return new NoteResponse(
                note.getId(),
                note.getChild().getId(),
                note.getTitle(),
                note.getContent(),
                "TEACHER",
                note.getCreatedAt()
        );
    }
}