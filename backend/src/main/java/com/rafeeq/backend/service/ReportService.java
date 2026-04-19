package com.rafeeq.backend.service;

import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.report.CreateReportRequest;
import com.rafeeq.backend.dto.report.ReportResponse;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Report;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.ReportRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final ChildProfileRepository childProfileRepository;

    public ReportResponse addTeacherReport(CreateReportRequest request, String nationalId) {

        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        Teacher teacher = teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Teacher profile not found"));

        ChildProfile child = childProfileRepository.findById(request.getChildId())
                .orElseThrow(() -> new NotFoundException("Child not found"));

        Report report = new Report();
        report.setId(UUID.randomUUID());
        report.setTeacher(teacher);
        report.setChild(child);
        report.setTitle(request.getTitle());
        report.setContent(request.getContent());
        report.setCreatedAt(LocalDateTime.now());

        reportRepository.save(report);

        return map(report);
    }

    public List<ReportResponse> getTeacherReports(UUID childId, String nationalId) {
        return reportRepository.findByChildId(childId)
                .stream()
                .map(this::map)
                .toList();
    }

    public List<ReportResponse> getParentReports(UUID childId, String nationalId) {
        return reportRepository.findByChildId(childId)
                .stream()
                .map(this::map)
                .toList();
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