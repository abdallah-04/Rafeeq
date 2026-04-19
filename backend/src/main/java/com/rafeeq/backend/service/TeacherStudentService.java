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
import com.rafeeq.backend.entity_enums.Gender;
import com.rafeeq.backend.entity_enums.LearningDifficulty;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeacherStudentService {

    private final TeacherRepository teacherRepository;
    private final ChildProfileRepository childProfileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentResponse createStudent(CreateStudentRequest request, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Teacher teacher = teacherRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));

        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone already exists");
        }

        if (request.getNationalId() != null
                && !request.getNationalId().isBlank()
                && userRepository.existsByNationalId(request.getNationalId())) {
            throw new ConflictException("National ID already exists");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        Integer fixedLevel = normalizeLevel(request.getLevel());
        Gender fixedGender = normalizeGender(request.getGender());
        LearningDifficulty fixedDifficulty = normalizeLearningDifficulty(request.getLearningDifficulty());

        User studentUser = new User();
        studentUser.setId(UUID.randomUUID());
        studentUser.setRole(UserRole.CHILD);
        studentUser.setPhone(request.getPhone());
        studentUser.setEmail(null);
        studentUser.setNationalId(request.getNationalId());
        studentUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        studentUser.setLanguage(AppLanguage.AR);
        studentUser.setIsActive(true);
        studentUser.setIsVerified(true);

        userRepository.save(studentUser);

        ChildProfile child = new ChildProfile();
        child.setUser(studentUser);
        child.setTeacher(teacher);
        child.setParent(null);
        child.setFullNameAr(request.getFullNameAr());
        child.setFullNameEn(request.getFullNameEn());
        child.setClassName(request.getClassName());
        child.setLevel(fixedLevel);
        child.setGender(fixedGender);
        child.setDateOfBirth(request.getDateOfBirth());
        child.setLearningDifficulty(fixedDifficulty);

        childProfileRepository.save(child);

        return mapToResponse(child);
    }

    public List<StudentResponse> getMyStudents(String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Teacher teacher = teacherRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));

        return childProfileRepository.findByTeacherId(teacher.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public StudentResponse getStudentById(UUID studentId, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Teacher teacher = teacherRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));

        ChildProfile child = childProfileRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        if (child.getTeacher() == null || !child.getTeacher().getId().equals(teacher.getId())) {
            throw new BadRequestException("You are not allowed to access this student");
        }

        return mapToResponse(child);
    }

    public StudentResponse updateStudent(UUID studentId, UpdateStudentRequest request, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Teacher teacher = teacherRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));

        ChildProfile child = childProfileRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        if (child.getTeacher() == null || !child.getTeacher().getId().equals(teacher.getId())) {
            throw new BadRequestException("You are not allowed to update this student");
        }

        child.setFullNameAr(request.getFullNameAr());
        child.setFullNameEn(request.getFullNameEn());
        child.setClassName(request.getClassName());
        child.setLevel(normalizeLevel(request.getLevel()));
        child.setGender(normalizeGender(request.getGender()));
        child.setDateOfBirth(request.getDateOfBirth());
        child.setLearningDifficulty(normalizeLearningDifficulty(request.getLearningDifficulty()));

        childProfileRepository.save(child);

        return mapToResponse(child);
    }

    public MessageResponse deleteStudent(UUID studentId, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Teacher teacher = teacherRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));

        ChildProfile child = childProfileRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        if (child.getTeacher() == null || !child.getTeacher().getId().equals(teacher.getId())) {
            throw new BadRequestException("You are not allowed to delete this student");
        }

        User childUser = child.getUser();

        childProfileRepository.delete(child);

        if (childUser != null) {
            userRepository.delete(childUser);
        }

        return new MessageResponse(true, "Student deleted successfully");
    }

    private Integer normalizeLevel(String level) {
        if (level == null || level.isBlank()) {
            throw new BadRequestException("Level is required");
        }

        String value = level.trim().toUpperCase();

        return switch (value) {
            case "1", "LEVEL_1" -> 1;
            case "2", "LEVEL_2" -> 2;
            case "3", "LEVEL_3" -> 3;
            case "4", "LEVEL_4" -> 4;
            case "5", "LEVEL_5" -> 5;
            default -> throw new BadRequestException("Invalid level value");
        };
    }

    private Gender normalizeGender(String gender) {
        if (gender == null || gender.isBlank()) {
            throw new BadRequestException("Gender is required");
        }

        try {
            return Gender.valueOf(gender.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid gender value");
        }
    }

    private LearningDifficulty normalizeLearningDifficulty(String learningDifficulty) {
        if (learningDifficulty == null || learningDifficulty.isBlank()) {
            throw new BadRequestException("Learning difficulty is required");
        }

        try {
            return LearningDifficulty.valueOf(learningDifficulty.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid learning difficulty value");
        }
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
                child.getTeacher() != null ? child.getTeacher().getId() : null
        );
    }
}