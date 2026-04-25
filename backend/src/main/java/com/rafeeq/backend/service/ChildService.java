package com.rafeeq.backend.service;

import com.rafeeq.backend.common.BadRequestException;
import com.rafeeq.backend.common.ConflictException;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.child.ChildResponse;
import com.rafeeq.backend.dto.child.ChildSummaryResponse;
import com.rafeeq.backend.dto.child.LinkChildRequest;
import com.rafeeq.backend.dto.child.UpdateChildRequest;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.ChildStatus;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.ActivityRepository;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.HomeworkRepository;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.QuizRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChildService {

    private final ChildProfileRepository childProfileRepository;
    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final HomeworkRepository homeworkRepository;
    private final ActivityRepository activityRepository;

    public List<ChildResponse> getMyChildren(String nationalId) {
        Parent parent = getCurrentParent(nationalId);

        return childProfileRepository.findByParentId(parent.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ChildResponse getChildById(UUID childId, String nationalId) {
        ChildProfile child = getLinkedChild(childId, nationalId);
        return mapToResponse(child);
    }

    @Transactional
    public MessageResponse linkChildByNationalId(LinkChildRequest request, String nationalId) {
        Parent parent = getCurrentParent(nationalId);

        User childUser = userRepository.findByNationalId(request.getNationalId().trim())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        if (childUser.getRole() != UserRole.CHILD) {
            throw new NotFoundException("Child not found");
        }

        ChildProfile child = childProfileRepository.findByUserId(childUser.getId())
                .orElseThrow(() -> new NotFoundException("Child profile not found"));

        if (child.getStatus() != ChildStatus.ACTIVE || child.getPlacementCompletedAt() == null) {
            throw new BadRequestException("Child cannot be linked before placement is completed");
        }

        if (!Boolean.TRUE.equals(childUser.getIsActive())) {
            throw new BadRequestException("Child account is not active yet");
        }

        if (child.getParent() != null) {
            if (child.getParent().getId().equals(parent.getId())) {
                throw new ConflictException("Child already linked to your account");
            }
            throw new ConflictException("Child already linked to another parent");
        }

        child.setParent(parent);
        childProfileRepository.save(child);

        return new MessageResponse(true, "Child linked successfully");
    }

    @Transactional
    public ChildResponse updateChild(UUID childId, UpdateChildRequest request, String nationalId) {
        ChildProfile child = getLinkedChild(childId, nationalId);

        if (request.getFullNameAr() != null && !request.getFullNameAr().isBlank()) {
            child.setFullNameAr(request.getFullNameAr().trim());
        }
        if (request.getFullNameEn() != null) {
            child.setFullNameEn(request.getFullNameEn().isBlank() ? null : request.getFullNameEn().trim());
        }

        return mapToResponse(child);
    }

    @Transactional
    public MessageResponse deleteChild(UUID childId, String nationalId) {
        ChildProfile child = getLinkedChild(childId, nationalId);
        child.setParent(null);
        childProfileRepository.save(child);
        return new MessageResponse(true, "Child unlinked successfully");
    }

    public ChildSummaryResponse getChildSummary(UUID childId, String nationalId) {
        ChildProfile child = getLinkedChild(childId, nationalId);

        int quizzesCount = Math.toIntExact(quizRepository.countByChildId(child.getId()));
        int homeworksCount = Math.toIntExact(homeworkRepository.countByChildId(child.getId()));
        int activitiesCount = Math.toIntExact(activityRepository.countByChildId(child.getId()));

        int progressPercentage = 0;
        int total = quizzesCount + homeworksCount + activitiesCount;
        if (total > 0) {
            progressPercentage = Math.min(100, total * 10);
        }

        String childName = child.getFullNameAr() != null && !child.getFullNameAr().isBlank()
                ? child.getFullNameAr()
                : child.getFullNameEn();

        return new ChildSummaryResponse(
                child.getId(),
                childName,
                child.getLevel(),
                child.getLearningDifficulty() != null ? child.getLearningDifficulty().name() : null,
                quizzesCount,
                homeworksCount,
                activitiesCount,
                progressPercentage
        );
    }

    private Parent getCurrentParent(String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));
    }

    private ChildProfile getLinkedChild(UUID childId, String nationalId) {
        Parent parent = getCurrentParent(nationalId);

        return childProfileRepository.findByIdAndParentId(childId, parent.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));
    }

    private ChildResponse mapToResponse(ChildProfile child) {
        return new ChildResponse(
                child.getId(),
                child.getUser() != null ? child.getUser().getId() : null,
                child.getFullNameAr(),
                child.getFullNameEn(),
                child.getClassName(),
                child.getLevel(),
                child.getGender(),
                child.getDateOfBirth(),
                child.getLearningDifficulty(),
                child.getParent() != null ? child.getParent().getId() : null,
                child.getTeacher() != null ? child.getTeacher().getId() : null,
                child.getUser() != null ? child.getUser().getPhone() : null,
                child.getUser() != null ? child.getUser().getNationalId() : null,
                child.getStatus() != null ? child.getStatus().name() : null,
                child.getAssessedLevel(),
                child.getPlacementCompletedAt(),
                child.getUser() != null ? child.getUser().getIsActive() : null
        );
    }
}
