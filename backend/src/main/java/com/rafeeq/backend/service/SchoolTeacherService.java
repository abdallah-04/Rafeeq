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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SchoolTeacherService {

    private final SchoolRepository schoolRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherResponse createTeacher(CreateTeacherRequest request, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        School school = schoolRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("School profile not found"));

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw new ConflictException("Phone already exists");
        }

        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already exists");
        }

        if (request.getNationalId() != null && userRepository.existsByNationalId(request.getNationalId())) {
            throw new ConflictException("National ID already exists");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        User teacherUser = new User();
        teacherUser.setId(UUID.randomUUID());
        teacherUser.setRole(UserRole.TEACHER);
        teacherUser.setPhone(request.getPhone());
        teacherUser.setEmail(request.getEmail());
        teacherUser.setNationalId(request.getNationalId());
        teacherUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        teacherUser.setLanguage(AppLanguage.AR);
        teacherUser.setIsActive(true);
        teacherUser.setIsVerified(true);

        userRepository.save(teacherUser);

        Teacher teacher = new Teacher();
        teacher.setUser(teacherUser);
        teacher.setSchool(school);
        teacher.setFullNameAr(request.getFullNameAr());
        teacher.setFullNameEn(request.getFullNameEn());
        teacher.setSpecialization(request.getSpecialization());

        teacherRepository.save(teacher);

        return mapToResponse(teacher);
    }

    public List<TeacherResponse> getMyTeachers(String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        School school = schoolRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("School profile not found"));

        return teacherRepository.findBySchoolId(school.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    public Object getAll(String nationalId){ return java.util.List.of(); }
    public Object getOne(UUID id){ return java.util.Map.of("id", id); }
    public Object update(UUID id, Object request){ return java.util.Map.of("success", true); }
    public void delete(UUID id){}
    public TeacherResponse getTeacherById(UUID teacherId, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        School school = schoolRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("School profile not found"));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        if (teacher.getSchool() == null || !teacher.getSchool().getId().equals(school.getId())) {
            throw new BadRequestException("You are not allowed to access this teacher");
        }

        return mapToResponse(teacher);
    }

    public TeacherResponse updateTeacher(UUID teacherId, UpdateTeacherRequest request, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        School school = schoolRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("School profile not found"));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        if (teacher.getSchool() == null || !teacher.getSchool().getId().equals(school.getId())) {
            throw new BadRequestException("You are not allowed to update this teacher");
        }

        teacher.setFullNameAr(request.getFullNameAr());
        teacher.setFullNameEn(request.getFullNameEn());
        teacher.setSpecialization(request.getSpecialization());

        teacherRepository.save(teacher);

        return mapToResponse(teacher);
    }

    public MessageResponse deleteTeacher(UUID teacherId, String nationalId) {
        User currentUser = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        School school = schoolRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("School profile not found"));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        if (teacher.getSchool() == null || !teacher.getSchool().getId().equals(school.getId())) {
            throw new BadRequestException("You are not allowed to delete this teacher");
        }

        User teacherUser = teacher.getUser();

        teacherRepository.delete(teacher);

        if (teacherUser != null) {
            userRepository.delete(teacherUser);
        }

        return new MessageResponse(true, "Teacher deleted successfully");
    }

    private TeacherResponse mapToResponse(Teacher teacher) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getUser() != null ? teacher.getUser().getId() : null,
                teacher.getFullNameAr(),
                teacher.getFullNameEn(),
                teacher.getSpecialization(),
                teacher.getSchool() != null ? teacher.getSchool().getId() : null
        );
    }
}