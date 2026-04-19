package com.rafeeq.backend.service;

import com.rafeeq.backend.common.BadRequestException;
import com.rafeeq.backend.common.ConflictException;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.teacher.CreateStudentRequest;
import com.rafeeq.backend.dto.teacher.StudentResponse;
import com.rafeeq.backend.dto.teacher.UpdateStudentRequest;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.AppLanguage;
import com.rafeeq.backend.entity_enums.ChildStatus;
import com.rafeeq.backend.entity_enums.Gender;
import com.rafeeq.backend.entity_enums.LearningDifficulty;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeacherStudentService {

    private static final String DEFAULT_CHILD_CLASS = "Placement Pending";
    private static final String GENERATED_CHILD_PASSWORD_PREFIX = "Rafeeq@";

    private final TeacherRepository teacherRepository;
    private final ChildProfileRepository childProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StudentResponse createStudent(CreateStudentRequest request, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);
        validateStudentCreationRequest(request);

        User studentUser = new User();
        studentUser.setRole(UserRole.CHILD);
        studentUser.setPhone(blankToNull(request.getPhone()));
        studentUser.setEmail(null);
        studentUser.setNationalId(request.getNationalId().trim());
        studentUser.setPasswordHash(passwordEncoder.encode(resolveChildPassword(request)));
        studentUser.setLanguage(AppLanguage.AR);
        studentUser.setIsActive(false);
        studentUser.setIsVerified(true);
        studentUser = userRepository.save(studentUser);

        ChildProfile child = new ChildProfile();
        child.setUser(studentUser);
        child.setTeacher(teacher);
        child.setParent(null);
        child.setFullNameAr(resolveChildName(request));
        child.setFullNameEn(blankToNull(request.getFullNameEn()));
        child.setClassName(resolveClassName(request.getClassName()));
        child.setLevel(null);
        child.setAssessedLevel(null);
        child.setStatus(ChildStatus.PENDING_PLACEMENT);
        child.setPlacementCompletedAt(null);
        child.setGender(normalizeGender(request.getGender()));
        child.setDateOfBirth(request.getDateOfBirth());
        child.setLearningDifficulty(normalizeLearningDifficulty(request.getLearningDifficulty()));
        childProfileRepository.save(child);

        return mapToResponse(child);
    }

    public List<StudentResponse> getMyStudents(String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);

        return childProfileRepository.findByTeacherId(teacher.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public StudentResponse getStudentById(UUID studentId, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);

        ChildProfile child = childProfileRepository.findByIdAndTeacherId(studentId, teacher.getId())
                .orElseThrow(() -> new NotFoundException("Student not found"));

        return mapToResponse(child);
    }

    @Transactional
    public StudentResponse updateStudent(UUID studentId, UpdateStudentRequest request, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);

        ChildProfile child = childProfileRepository.findByIdAndTeacherId(studentId, teacher.getId())
                .orElseThrow(() -> new NotFoundException("Student not found"));

        if (blankToNull(request.getFullNameAr()) != null) {
            child.setFullNameAr(request.getFullNameAr().trim());
        }
        child.setFullNameEn(blankToNull(request.getFullNameEn()));
        if (blankToNull(request.getClassName()) != null) {
            child.setClassName(request.getClassName().trim());
        }
        if (blankToNull(request.getLevel()) != null) {
            child.setLevel(normalizeLevel(request.getLevel()));
        }
        if (blankToNull(request.getGender()) != null) {
            child.setGender(normalizeGender(request.getGender()));
        }
        if (request.getDateOfBirth() != null) {
            child.setDateOfBirth(request.getDateOfBirth());
        }
        if (blankToNull(request.getLearningDifficulty()) != null) {
            child.setLearningDifficulty(normalizeLearningDifficulty(request.getLearningDifficulty()));
        }

        return mapToResponse(child);
    }

    @Transactional
    public MessageResponse deleteStudent(UUID studentId, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);

        ChildProfile child = childProfileRepository.findByIdAndTeacherId(studentId, teacher.getId())
                .orElseThrow(() -> new NotFoundException("Student not found"));

        User childUser = child.getUser();
        childProfileRepository.delete(child);

        if (childUser != null) {
            userRepository.delete(childUser);
        }

        return new MessageResponse(true, "Student deleted successfully");
    }

    private Teacher getCurrentTeacher(String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return teacherRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));
    }

    private void validateStudentCreationRequest(CreateStudentRequest request) {
        if (request.getNationalId() != null && userRepository.existsByNationalId(request.getNationalId().trim())) {
            throw new ConflictException("National ID already exists");
        }

        if (request.getPhone() != null && !request.getPhone().isBlank() && userRepository.existsByPhone(request.getPhone().trim())) {
            throw new ConflictException("Phone already exists");
        }

        if (request.getDateOfBirth() == null) {
            throw new BadRequestException("Date of birth is required");
        }
    }

    private String resolveChildName(CreateStudentRequest request) {
        String name = blankToNull(request.getFullNameAr());
        if (name != null) {
            return name;
        }
        throw new BadRequestException("Child name is required");
    }

    private String resolveClassName(String className) {
        String normalized = blankToNull(className);
        return normalized != null ? normalized : DEFAULT_CHILD_CLASS;
    }

    private String resolveChildPassword(CreateStudentRequest request) {
        String password = blankToNull(request.getPassword());
        if (password != null) {
            return password;
        }

        String nationalId = request.getNationalId() != null ? request.getNationalId().trim() : null;
        if (nationalId == null || nationalId.length() < 4) {
            throw new BadRequestException("Child password or a valid national ID is required");
        }

        return GENERATED_CHILD_PASSWORD_PREFIX + nationalId.substring(nationalId.length() - 4);
    }

    private Integer normalizeLevel(String level) {
        if (level == null || level.isBlank()) {
            throw new BadRequestException("Level is required");
        }

        String value = level.trim().toUpperCase(Locale.ROOT);

        return switch (value) {
            case "1", "LEVEL_1" -> 1;
            case "2", "LEVEL_2" -> 2;
            case "3", "LEVEL_3" -> 3;
            default -> throw new BadRequestException("Invalid level value");
        };
    }

    private Gender normalizeGender(String gender) {
        if (gender == null || gender.isBlank()) {
            throw new BadRequestException("Gender is required");
        }

        try {
            return Gender.valueOf(gender.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid gender value");
        }
    }

    private LearningDifficulty normalizeLearningDifficulty(String learningDifficulty) {
        if (learningDifficulty == null || learningDifficulty.isBlank()) {
            throw new BadRequestException("Learning difficulty is required");
        }

        String normalized = learningDifficulty.trim().toUpperCase(Locale.ROOT)
                .replace(' ', '_');

        normalized = switch (normalized) {
            case "AUTISM", "ASD" -> "AUTISM";
            case "ADD", "ADHD" -> "ADHD";
            case "DYS", "DYSLEXIA" -> "DYSLEXIA";
            case "DOWNSYNDROME", "DOWN_SYNDROME", "IFD", "DEVELOPMENTAL_DELAY" -> "DEVELOPMENTAL_DELAY";
            case "SPEECHDELAY", "SPEECH_DELAY" -> "SPEECH_DELAY";
            case "OTHER" -> "OTHER";
            default -> normalized;
        };

        try {
            return LearningDifficulty.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid learning difficulty value");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private StudentResponse mapToResponse(ChildProfile child) {
        return new StudentResponse(
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
