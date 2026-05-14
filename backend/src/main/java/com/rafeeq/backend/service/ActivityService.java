package com.rafeeq.backend.service;

import com.rafeeq.backend.common.LanguageUtil;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.activity.ActivityResponse;
import com.rafeeq.backend.entity.Activity;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.LearningTree;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.ActivityRepository;
import com.rafeeq.backend.repository.LearningTreeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActivityService {

    private static final String TREE_STATUS_ACTIVE = "active";

    private final ActivityRepository activityRepository;
    private final LearningTreeRepository learningTreeRepository;
    private final AccessService accessService;

    public List<ActivityResponse> getActivities(UUID childId, String nationalId, String acceptLanguage) {
        ChildProfile child = accessService.getAccessibleChild(childId, nationalId);
        User user = accessService.getCurrentUser(nationalId);

        List<Activity> activities = user.getRole() == UserRole.PARENT
                ? findCurrentTreeActivities(child.getId())
                : activityRepository.findByChildId(child.getId());

        return activities
                .stream()
                .sorted(Comparator
                        .comparing(Activity::getGroupNumber, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(Activity::getOrderNum, Comparator.nullsLast(Integer::compareTo)))
                .map(activity -> map(activity, acceptLanguage))
                .toList();
    }

    public ActivityResponse getActivity(UUID activityId, String nationalId, String acceptLanguage) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new NotFoundException("Activity not found"));
        accessService.getAccessibleChild(activity.getChild().getId(), nationalId);
        return map(activity, acceptLanguage);
    }

    private List<Activity> findCurrentTreeActivities(UUID childId) {
        return learningTreeRepository.findFirstByChildIdAndStatusOrderByGeneratedAtDesc(childId, TREE_STATUS_ACTIVE)
                .map(LearningTree::getId)
                .map(treeId -> activityRepository.findByChildIdAndTreeId(childId, treeId))
                .orElseGet(List::of);
    }

    private ActivityResponse map(Activity activity, String acceptLanguage) {
        return new ActivityResponse(
                activity.getId(),
                activity.getChild().getId(),
                activity.getTree() != null ? activity.getTree().getId() : null,
                activity.getTreeItemId(),
                LanguageUtil.pick(acceptLanguage, activity.getTitleAr(), activity.getTitleEn()),
                LanguageUtil.pick(acceptLanguage, activity.getDescriptionAr(), activity.getDescriptionEn()),
                LanguageUtil.pick(
                        acceptLanguage,
                        LanguageUtil.firstNonBlank(activity.getInstructionsAr(), activity.getActivityTaskAr()),
                        LanguageUtil.firstNonBlank(activity.getInstructionsEn(), activity.getActivityTaskEn())
                ),
                LanguageUtil.pick(acceptLanguage, activity.getMaterialsNeededAr(), activity.getMaterialsNeededEn()),
                LanguageUtil.pick(acceptLanguage, activity.getExpectedOutcomeAr(), activity.getExpectedOutcomeEn()),
                activity.getStatus(),
                activity.getGroupNumber(),
                activity.getOrderNum(),
                activity.getCompletedAt()
        );
    }
}
