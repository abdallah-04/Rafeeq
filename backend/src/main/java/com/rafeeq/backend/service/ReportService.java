package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.report.CreateReportRequest;
import com.rafeeq.backend.dto.report.ReportResponse;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Parent;
import com.rafeeq.backend.entity.Report;
import com.rafeeq.backend.entity.School;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.ParentRepository;
import com.rafeeq.backend.repository.ReportRepository;
import com.rafeeq.backend.repository.SchoolRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final TeacherRepository teacherRepository;
    private final ParentRepository parentRepository;
    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final ChildProfileRepository childProfileRepository;

    @Transactional
    public ReportResponse addTeacherReport(CreateReportRequest request, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);
        ChildProfile child = childProfileRepository.findByIdAndTeacherId(request.getChildId(), teacher.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        Report report = new Report();
        report.setId(UUID.randomUUID());
        report.setTeacher(teacher);
        report.setChild(child);
        report.setTitle(request.getTitle().trim());
        report.setContent(request.getContent().trim());
        report.setCreatedAt(LocalDateTime.now());
        reportRepository.save(report);

        return map(report);
    }

    public List<ReportResponse> getTeacherReports(UUID childId, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);
        childProfileRepository.findByIdAndTeacherId(childId, teacher.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        return reportRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    public List<ReportResponse> getParentReports(UUID childId, String nationalId) {
        Parent parent = getCurrentParent(nationalId);
        childProfileRepository.findByIdAndParentId(childId, parent.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        return reportRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    public List<ReportResponse> getSchoolReports(UUID childId, String nationalId) {
        School school = getCurrentSchool(nationalId);
        childProfileRepository.findByIdAndTeacherSchoolId(childId, school.getId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        return reportRepository.findByChildIdOrderByCreatedAtDesc(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    private Teacher getCurrentTeacher(String nationalId) {
        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));
    }

    private Parent getCurrentParent(String nationalId) {
        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Parent not found"));
    }

    private School getCurrentSchool(String nationalId) {
        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return schoolRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("School not found"));
    }

    private ReportResponse map(Report report) {
        return new ReportResponse(
                report.getId(),
                report.getChild().getId(),
                report.getTitle(),
                report.getContent(),
                "TEACHER",
                report.getCreatedAt()
        );
    }
}
