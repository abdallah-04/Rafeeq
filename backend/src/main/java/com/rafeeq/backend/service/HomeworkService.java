package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.homework.CreateHomeworkRequest;
import com.rafeeq.backend.dto.homework.HomeworkResponse;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Homework;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.HomeworkRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HomeworkService {

    private final HomeworkRepository homeworkRepository;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final ChildProfileRepository childProfileRepository;

    public HomeworkResponse addTeacherHomework(CreateHomeworkRequest request, String nationalId) {

        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        ChildProfile child = childProfileRepository.findById(request.getChildId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        Homework hw = new Homework();
        hw.setTeacher(teacher);
        hw.setChild(child);
        hw.setTitleAr(request.getTitle());
        hw.setTitleEn(request.getTitle());
        hw.setFeedbackAr(request.getDescription());
        hw.setFeedbackEn(request.getDescription());
        hw.setStartDate(LocalDate.now());
        hw.setDueDate(request.getDueDate());
        hw.setStatus("ASSIGNED");

        homeworkRepository.save(hw);

        return map(hw);
    }

    public List<HomeworkResponse> getTeacherHomework(UUID childId, String nationalId) {
        return homeworkRepository.findByChildId(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    public List<HomeworkResponse> getParentHomework(UUID childId, String nationalId) {
        return homeworkRepository.findByChildId(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    private HomeworkResponse map(Homework hw) {
        LocalDateTime createdAt = hw.getStartDate() != null
                ? hw.getStartDate().atStartOfDay()
                : null;

        return new HomeworkResponse(
                hw.getId(),
                hw.getChild().getId(),
                hw.getTitleAr(),
                hw.getFeedbackAr(),
                hw.getDueDate(),
                hw.getStatus(),
                "TEACHER",
                createdAt
        );
    }
}