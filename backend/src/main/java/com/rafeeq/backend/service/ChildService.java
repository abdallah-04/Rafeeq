package com.rafeeq.backend.service;

import com.rafeeq.backend.common.BadRequestException;
import com.rafeeq.backend.common.ConflictException;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.child.ChildResponse;
import com.rafeeq.backend.dto.child.ChildSummaryResponse;
import com.rafeeq.backend.dto.child.CreateChildRequest;
import com.rafeeq.backend.dto.child.LinkChildRequest;
import com.rafeeq.backend.dto.child.UpdateChildRequest;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.AppLanguage;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildProfileRepository childProfileRepository;
    private final ParentRepository parentRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<ChildResponse> getMyChildren(String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Parent parent = parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));

        return childProfileRepository.findByParentId(parent.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ChildResponse getChildById(UUID childId, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Parent parent = parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));

        ChildProfile child = childProfileRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Child not found"));

        if (child.getParent() == null || !child.getParent().getId().equals(parent.getId())) {
            throw new BadRequestException("You are not allowed to access this child");
        }

        return mapToResponse(child);
    }

    public MessageResponse linkChildByNationalId(LinkChildRequest request, String nationalId) {
    User currentUser = userRepository.findByNationalId(nationalId)
            .orElseThrow(() -> new NotFoundException("User not found"));

    Parent parent = parentRepository.findByUserId(currentUser.getId())
            .orElseThrow(() -> new NotFoundException("Parent profile not found"));

    User childUser = userRepository.findByNationalId(request.getNationalId())
            .orElseThrow(() -> new NotFoundException("Child not found"));

    ChildProfile child = childProfileRepository.findByUserId(childUser.getId())
            .orElseThrow(() -> new NotFoundException("Child profile not found"));

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

    public ChildResponse updateChild(UUID childId, UpdateChildRequest request, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Parent parent = parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));

        ChildProfile child = childProfileRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Child not found"));

        if (child.getParent() == null || !child.getParent().getId().equals(parent.getId())) {
            throw new BadRequestException("You are not allowed to update this child");
        }

        Teacher teacher = child.getTeacher();
        if (request.getTeacherId() != null) {
            teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new NotFoundException("Teacher not found"));
        }

        child.setTeacher(teacher);
        child.setFullNameAr(request.getFullNameAr());
        child.setFullNameEn(request.getFullNameEn());
        child.setClassName(request.getClassName());
        child.setLevel(request.getLevel());
        child.setGender(request.getGender());
        child.setDateOfBirth(request.getDateOfBirth());
        child.setLearningDifficulty(request.getLearningDifficulty());

        childProfileRepository.save(child);

        return mapToResponse(child);
    }

    public MessageResponse deleteChild(UUID childId, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Parent parent = parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));

        ChildProfile child = childProfileRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Child not found"));

        if (child.getParent() == null || !child.getParent().getId().equals(parent.getId())) {
            throw new BadRequestException("You are not allowed to delete this child");
        }

        User childUser = child.getUser();

        childProfileRepository.delete(child);

        if (childUser != null) {
            userRepository.delete(childUser);
        }

        return new MessageResponse(true, "Child deleted successfully");
    }

    public ChildSummaryResponse getChildSummary(UUID childId, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Parent parent = parentRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Parent profile not found"));

        ChildProfile child = childProfileRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Child not found"));

        if (child.getParent() == null || !child.getParent().getId().equals(parent.getId())) {
            throw new BadRequestException("You are not allowed to access this child");
        }

        int quizzesCount = child.getQuizzes() != null ? child.getQuizzes().size() : 0;
        int homeworksCount = child.getHomeworks() != null ? child.getHomeworks().size() : 0;
        int activitiesCount = child.getActivities() != null ? child.getActivities().size() : 0;

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
                child.getTeacher() != null ? child.getTeacher().getId() : null
        );
    }
}