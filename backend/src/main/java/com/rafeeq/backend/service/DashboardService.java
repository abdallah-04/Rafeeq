package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.SchoolRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final ChildProfileRepository childProfileRepository;

    public Map<String, Object> teacher(String nationalId) {

        UUID userId = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"))
                .getId();

        UUID teacherId = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Teacher not found"))
                .getId();

        long studentsCount = childProfileRepository.countByTeacherId(teacherId);

        Map<String, Object> map = new HashMap<>();
        map.put("studentsCount", studentsCount);
        map.put("classesCount", 1);
        map.put("lastActivity", "Dashboard loaded");

        return map;
    }

    public Map<String, Object> parent(String nationalId) {

        UUID userId = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"))
                .getId();

        UUID parentId = parentRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Parent not found"))
                .getId();

        long childrenCount = childProfileRepository.countByParentId(parentId);

        Map<String, Object> map = new HashMap<>();
        map.put("childrenCount", childrenCount);
        map.put("progress", "GOOD");
        map.put("notifications", 0);

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

        Map<String, Object> map = new HashMap<>();
        map.put("teachersCount", teachersCount);
        map.put("studentsCount", studentsCount);
        map.put("summary", "School dashboard ready");

        return map;
    }
}