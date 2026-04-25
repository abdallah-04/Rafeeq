package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity_enums.ChildStatus;
import com.rafeeq.backend.repository.ActivityRepository;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.HomeworkRepository;
import com.rafeeq.backend.repository.NotificationRepository;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.QuizRepository;
import com.rafeeq.backend.repository.SchoolRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.TreeItemRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
    private final QuizRepository quizRepository;
    private final HomeworkRepository homeworkRepository;
    private final ActivityRepository activityRepository;
    private final TreeItemRepository treeItemRepository;

    public Map<String, Object> teacher(String nationalId) {

        UUID userId = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"))
                .getId();

        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        List<UUID> childIds = childProfileRepository.findIdsByTeacherId(teacher.getId());
        long studentsCount = childIds.size();
        long activeStudentsCount = childProfileRepository.countByTeacherIdAndStatus(teacher.getId(), ChildStatus.ACTIVE);
        long pendingPlacementCount = studentsCount - activeStudentsCount;
        int averageProgress = calculateTreeProgressAverage(childIds);

        Map<String, Object> map = new HashMap<>();
        map.put("studentsCount", studentsCount);
        map.put("activeStudentsCount", activeStudentsCount);
        map.put("pendingPlacementCount", pendingPlacementCount);
        map.put("averageProgress", averageProgress);
        map.put("progressPercentage", averageProgress);

        return map;
    }

    public Map<String, Object> parent(String nationalId) {

        UUID userId = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"))
                .getId();

        Parent parent = parentRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Parent not found"));

        List<UUID> childIds = childProfileRepository.findIdsByParentId(parent.getId());
        long childrenCount = childIds.size();
        long activeChildrenCount = childProfileRepository.countByParentIdAndStatus(parent.getId(), ChildStatus.ACTIVE);
        long unreadNotifications = notificationRepository.countByUserIdAndIsRead(userId, false);
        int progressAverage = childIds.isEmpty()
                ? 0
                : calculateProgressAverage(childIds);

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
        long pendingPlacementCount = childProfileRepository.countByTeacherSchoolIdAndStatusNot(schoolId, ChildStatus.ACTIVE);

        Map<String, Object> map = new HashMap<>();
        map.put("teachersCount", teachersCount);
        map.put("studentsCount", studentsCount);
        map.put("pendingPlacementCount", pendingPlacementCount);

        return map;
    }

    private int calculateProgressAverage(List<UUID> childIds) {
        Map<UUID, Integer> quizCounts = toCountMap(quizRepository.countByChildIds(childIds));
        Map<UUID, Integer> homeworkCounts = toCountMap(homeworkRepository.countByChildIds(childIds));
        Map<UUID, Integer> activityCounts = toCountMap(activityRepository.countByChildIds(childIds));

        return (int) Math.round(childIds.stream()
                .mapToInt(childId -> estimateProgress(
                        quizCounts.getOrDefault(childId, 0),
                        homeworkCounts.getOrDefault(childId, 0),
                        activityCounts.getOrDefault(childId, 0)
                ))
                .average()
                .orElse(0));
    }

    private int calculateTreeProgressAverage(List<UUID> childIds) {
        if (childIds.isEmpty()) {
            return 0;
        }

        Map<UUID, ProgressTotals> progressByChild = toProgressMap(treeItemRepository.countProgressByChildIds(childIds));

        return (int) Math.round(childIds.stream()
                .mapToInt(childId -> {
                    ProgressTotals totals = progressByChild.get(childId);
                    if (totals == null || totals.totalItems() == 0) {
                        return 0;
                    }
                    return (int) Math.round((totals.completedItems() * 100.0) / totals.totalItems());
                })
                .average()
                .orElse(0));
    }

    private Map<UUID, Integer> toCountMap(List<Object[]> rows) {
        Map<UUID, Integer> counts = new HashMap<>();
        for (Object[] row : rows) {
            counts.put((UUID) row[0], ((Number) row[1]).intValue());
        }
        return counts;
    }

    private Map<UUID, ProgressTotals> toProgressMap(List<Object[]> rows) {
        Map<UUID, ProgressTotals> progress = new HashMap<>();
        for (Object[] row : rows) {
            progress.put(
                    (UUID) row[0],
                    new ProgressTotals(
                            ((Number) row[1]).intValue(),
                            ((Number) row[2]).intValue()
                    )
            );
        }
        return progress;
    }

    private int estimateProgress(int quizzesCount, int homeworksCount, int activitiesCount) {
        int total = quizzesCount + homeworksCount + activitiesCount;
        return total > 0 ? Math.min(100, total * 10) : 0;
    }

    private record ProgressTotals(int totalItems, int completedItems) {
    }
}
