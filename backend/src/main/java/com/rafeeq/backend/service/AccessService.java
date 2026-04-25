package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.School;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.SchoolRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccessService {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final TeacherRepository teacherRepository;
    private final SchoolRepository schoolRepository;
    private final ChildProfileRepository childProfileRepository;

    public User getCurrentUser(String nationalId) {
        return userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    public ChildProfile getAccessibleChild(UUID childId, String nationalId) {
        User user = getCurrentUser(nationalId);

        if (user.getRole() == UserRole.PARENT) {
            Parent parent = parentRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new NotFoundException("Parent not found"));
            return childProfileRepository.findByIdAndParentId(childId, parent.getId())
                    .orElseThrow(() -> new NotFoundException("Child not found"));
        }

        if (user.getRole() == UserRole.TEACHER) {
            Teacher teacher = teacherRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new NotFoundException("Teacher not found"));
            return childProfileRepository.findByIdAndTeacherId(childId, teacher.getId())
                    .orElseThrow(() -> new NotFoundException("Child not found"));
        }

        if (user.getRole() == UserRole.SCHOOL) {
            School school = schoolRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new NotFoundException("School not found"));
            return childProfileRepository.findByIdAndTeacherSchoolId(childId, school.getId())
                    .orElseThrow(() -> new NotFoundException("Child not found"));
        }

        if (user.getRole() == UserRole.CHILD) {
            return childProfileRepository.findByUserId(user.getId())
                    .filter(child -> child.getId().equals(childId))
                    .orElseThrow(() -> new NotFoundException("Child not found"));
        }

        return childProfileRepository.findById(childId)
                .orElseThrow(() -> new NotFoundException("Child not found"));
    }
}
