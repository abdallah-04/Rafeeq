package com.rafeeq.backend.service;

import com.rafeeq.backend.common.BadRequestException;
import com.rafeeq.backend.common.ConflictException;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.auth.MessageResponse;
import com.rafeeq.backend.dto.school.CreateTeacherRequest;
import com.rafeeq.backend.dto.school.TeacherResponse;
import com.rafeeq.backend.dto.school.UpdateTeacherRequest;
import com.rafeeq.backend.entity.School;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.AppLanguage;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.SchoolRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SchoolTeacherService {

    private static final String GENERATED_EMAIL_DOMAIN = "@teachers.rafeeq.local";

    private final SchoolRepository schoolRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public TeacherResponse createTeacher(CreateTeacherRequest request, String nationalId) {
        School school = getCurrentSchool(nationalId);

        String teacherEmail = normalizeTeacherEmail(request.getEmail(), request.getNationalId());
        validateTeacherCreationRequest(request, teacherEmail);

        User teacherUser = new User();
        teacherUser.setRole(UserRole.TEACHER);
        teacherUser.setPhone(request.getPhone().trim());
        teacherUser.setEmail(teacherEmail);
        teacherUser.setNationalId(request.getNationalId().trim());
        teacherUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        teacherUser.setLanguage(AppLanguage.AR);
        teacherUser.setIsActive(true);
        teacherUser.setIsVerified(true);
        teacherUser = userRepository.save(teacherUser);

        Teacher teacher = new Teacher();
        teacher.setUser(teacherUser);
        teacher.setSchool(school);
        teacher.setFullNameAr(normalizeTeacherName(request));
        teacher.setFullNameEn(blankToNull(request.getFullNameEn()));
        teacher.setSpecialization(blankToNull(request.getSpecialization()));
        teacherRepository.save(teacher);

        return mapToResponse(teacher);
    }

    public List<TeacherResponse> getMyTeachers(String nationalId) {
        School school = getCurrentSchool(nationalId);

        return teacherRepository.findBySchoolId(school.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TeacherResponse> getAll(String nationalId) {
        return getMyTeachers(nationalId);
    }

    public TeacherResponse getOne(UUID id, String nationalId) {
        return getTeacherById(id, nationalId);
    }

    @Transactional
    public TeacherResponse update(UUID id, UpdateTeacherRequest request, String nationalId) {
        return updateTeacher(id, request, nationalId);
    }

    @Transactional
    public MessageResponse delete(UUID id, String nationalId) {
        return deleteTeacher(id, nationalId);
    }

    public TeacherResponse getTeacherById(UUID teacherId, String nationalId) {
        School school = getCurrentSchool(nationalId);

        Teacher teacher = teacherRepository.findByIdAndSchoolId(teacherId, school.getId())
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        return mapToResponse(teacher);
    }

    @Transactional
    public TeacherResponse updateTeacher(UUID teacherId, UpdateTeacherRequest request, String nationalId) {
        School school = getCurrentSchool(nationalId);

        Teacher teacher = teacherRepository.findByIdAndSchoolId(teacherId, school.getId())
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        teacher.setFullNameAr(blankToNull(request.getFullNameAr()) != null ? request.getFullNameAr().trim() : teacher.getFullNameAr());
        teacher.setFullNameEn(blankToNull(request.getFullNameEn()));
        teacher.setSpecialization(blankToNull(request.getSpecialization()));

        return mapToResponse(teacher);
    }

    @Transactional
    public MessageResponse deleteTeacher(UUID teacherId, String nationalId) {
        School school = getCurrentSchool(nationalId);

        Teacher teacher = teacherRepository.findByIdAndSchoolId(teacherId, school.getId())
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        User teacherUser = teacher.getUser();
        teacherRepository.delete(teacher);

        if (teacherUser != null) {
            userRepository.delete(teacherUser);
        }

        return new MessageResponse(true, "Teacher deleted successfully");
    }

    private School getCurrentSchool(String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return schoolRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("School profile not found"));
    }

    private void validateTeacherCreationRequest(CreateTeacherRequest request, String normalizedEmail) {
        if (request.getNationalId() != null && userRepository.existsByNationalId(request.getNationalId().trim())) {
            throw new ConflictException("National ID already exists");
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone().trim())) {
            throw new ConflictException("Phone already exists");
        }

        if (normalizedEmail != null && userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email already exists");
        }

        if (request.getConfirmPassword() != null
                && !request.getConfirmPassword().isBlank()
                && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
    }

    private String normalizeTeacherEmail(String email, String nationalId) {
        if (email != null && !email.isBlank()) {
            return email.trim().toLowerCase();
        }

        if (nationalId == null || nationalId.isBlank()) {
            throw new BadRequestException("Teacher email or national ID is required");
        }

        return nationalId.trim() + GENERATED_EMAIL_DOMAIN;
    }

    private String normalizeTeacherName(CreateTeacherRequest request) {
        String fullNameAr = blankToNull(request.getFullNameAr());
        if (fullNameAr != null) {
            return fullNameAr;
        }

        throw new BadRequestException("Teacher name is required");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private TeacherResponse mapToResponse(Teacher teacher) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getUser() != null ? teacher.getUser().getId() : null,
                teacher.getFullNameAr(),
                teacher.getFullNameEn(),
                teacher.getSpecialization(),
                teacher.getSchool() != null ? teacher.getSchool().getId() : null,
                teacher.getUser() != null ? teacher.getUser().getPhone() : null,
                teacher.getUser() != null ? teacher.getUser().getEmail() : null,
                teacher.getUser() != null ? teacher.getUser().getNationalId() : null
        );
    }
}
