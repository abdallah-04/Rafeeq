package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.common.BadRequestException;
import com.rafeeq.backend.dto.homework.CreateHomeworkRequest;
import com.rafeeq.backend.dto.homework.HomeworkResponse;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Homework;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.ChildStatus;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.HomeworkRepository;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomeworkService {

    private static final String STATUS_PENDING = "pending";

    private final HomeworkRepository homeworkRepository;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final ChildProfileRepository childProfileRepository;

    @Transactional
    public HomeworkResponse addTeacherHomework(CreateHomeworkRequest request, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);
        ChildProfile child = childProfileRepository.findByIdAndTeacherId(request.getChildId(), teacher.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));
        ensureChildReadyForHomework(child);

        Homework hw = new Homework();
        hw.setTeacher(teacher);
        hw.setChild(child);
        hw.setTitleAr(request.getTitle().trim());
        hw.setTitleEn(request.getTitle().trim());
        hw.setFeedbackAr(request.getDescription().trim());
        hw.setFeedbackEn(request.getDescription().trim());
        hw.setStartDate(LocalDate.now());
        hw.setDueDate(request.getDueDate());
        hw.setStatus(STATUS_PENDING);
        homeworkRepository.save(hw);

        return map(hw);
    }

    public List<HomeworkResponse> getTeacherHomework(UUID childId, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);
        childProfileRepository.findByIdAndTeacherId(childId, teacher.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        return homeworkRepository.findByChildIdOrderByDueDateAsc(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    public List<HomeworkResponse> getParentHomework(UUID childId, String nationalId) {
        Parent parent = getCurrentParent(nationalId);
        childProfileRepository.findByIdAndParentId(childId, parent.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        return homeworkRepository.findByChildIdOrderByDueDateAsc(childId)
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

    private void ensureChildReadyForHomework(ChildProfile child) {
        if (child.getStatus() != ChildStatus.ACTIVE
                || child.getPlacementCompletedAt() == null
                || !Boolean.TRUE.equals(child.getUser().getIsActive())) {
            throw new BadRequestException("Homework can only be assigned after placement is completed");
        }
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
