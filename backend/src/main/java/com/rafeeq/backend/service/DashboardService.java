package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity_enums.ChildStatus;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.NotificationRepository;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.SchoolRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final ChildProfileRepository childProfileRepository;
    private final NotificationRepository notificationRepository;

    public Map<String, Object> teacher(String nationalId) {

        UUID userId = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"))
                .getId();

        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        var students = childProfileRepository.findByTeacherId(teacher.getId());
        long studentsCount = students.size();
        long activeStudentsCount = students.stream()
                .filter(child -> child.getStatus() == ChildStatus.ACTIVE)
                .count();
        long pendingPlacementCount = studentsCount - activeStudentsCount;

        Map<String, Object> map = new HashMap<>();
        map.put("studentsCount", studentsCount);
        map.put("activeStudentsCount", activeStudentsCount);
        map.put("pendingPlacementCount", pendingPlacementCount);

        return map;
    }

    public Map<String, Object> parent(String nationalId) {

        UUID userId = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"))
                .getId();

        Parent parent = parentRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Parent not found"));

        var children = childProfileRepository.findByParentId(parent.getId());
        long childrenCount = children.size();
        long activeChildrenCount = children.stream()
                .filter(child -> child.getStatus() == ChildStatus.ACTIVE)
                .count();
        long unreadNotifications = notificationRepository.findByUserIdAndIsRead(userId, false).size();
        int progressAverage = children.isEmpty()
                ? 0
                : (int) Math.round(children.stream()
                .mapToInt(this::estimateProgress)
                .average()
                .orElse(0));

        Map<String, Object> map = new HashMap<>();
        map.put("childrenCount", childrenCount);
        map.put("activeChildrenCount", activeChildrenCount);
        map.put("progressPercentage", progressAverage);
        map.put("unreadNotifications", unreadNotifications);

        return map;
    }

    public Map<String, Object> school(String nationalId) {

        UUID userId = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"))
                .getId();

        UUID schoolId = schoolRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("School not found"))
                .getId();

        long teachersCount = teacherRepository.countBySchoolId(schoolId);
        long studentsCount = childProfileRepository.countByTeacherSchoolId(schoolId);
        long pendingPlacementCount = teacherRepository.findBySchoolId(schoolId)
                .stream()
                .flatMap(teacher -> childProfileRepository.findByTeacherId(teacher.getId()).stream())
                .filter(child -> child.getStatus() != ChildStatus.ACTIVE)
                .count();

        Map<String, Object> map = new HashMap<>();
        map.put("teachersCount", teachersCount);
        map.put("studentsCount", studentsCount);
        map.put("pendingPlacementCount", pendingPlacementCount);

        return map;
    }

    private int estimateProgress(ChildProfile child) {
        int quizzesCount = child.getQuizzes() != null ? child.getQuizzes().size() : 0;
        int homeworksCount = child.getHomeworks() != null ? child.getHomeworks().size() : 0;
        int activitiesCount = child.getActivities() != null ? child.getActivities().size() : 0;
        int total = quizzesCount + homeworksCount + activitiesCount;
        return total > 0 ? Math.min(100, total * 10) : 0;
    }
}
