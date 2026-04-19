package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.note.CreateNoteRequest;
import com.rafeeq.backend.dto.note.NoteResponse;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Note;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.NoteRepository;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoteService {

    private final NoteRepository noteRepository;
    private final ChildProfileRepository childProfileRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final UserRepository userRepository;

    @Transactional
    public NoteResponse addTeacherNote(CreateNoteRequest request, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);
        ChildProfile child = childProfileRepository.findByIdAndTeacherId(request.getChildId(), teacher.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        Note note = new Note();
        note.setTeacher(teacher);
        note.setChild(child);
        note.setTitle(request.getTitle().trim());
        note.setContent(request.getContent().trim());
        noteRepository.save(note);

        return map(note);
    }

    public List<NoteResponse> getTeacherNotes(UUID childId, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);
        childProfileRepository.findByIdAndTeacherId(childId, teacher.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        return noteRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    public List<NoteResponse> getParentNotes(UUID childId, String nationalId) {
        Parent parent = getCurrentParent(nationalId);
        childProfileRepository.findByIdAndParentId(childId, parent.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        return noteRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    private Teacher getCurrentTeacher(String nationalId) {
        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Teacher not found"));
    }

    private Parent getCurrentParent(String nationalId) {
        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Parent not found"));
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
