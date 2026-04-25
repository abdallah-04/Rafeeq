package com.rafeeq.backend.service;

import com.rafeeq.backend.common.LanguageUtil;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.activity.ActivityResponse;
import com.rafeeq.backend.entity.Activity;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.repository.ActivityRepository;
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

    private final ActivityRepository activityRepository;
    private final AccessService accessService;

    public List<ActivityResponse> getActivities(UUID childId, String nationalId, String acceptLanguage) {
        ChildProfile child = accessService.getAccessibleChild(childId, nationalId);

        return activityRepository.findByChildId(child.getId())
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
