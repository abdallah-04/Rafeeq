package com.rafeeq.backend.service;

import com.rafeeq.backend.common.BadRequestException;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.assessment.PlacementAssessmentResponse;
import com.rafeeq.backend.dto.assessment.PlacementQuestionResponse;
import com.rafeeq.backend.dto.assessment.PlacementSubmissionResponse;
import com.rafeeq.backend.dto.assessment.SubmitPlacementRequest;
import com.rafeeq.backend.entity.AssessmentQuestion;
import com.rafeeq.backend.entity.ChildAssessment;
import com.rafeeq.backend.entity.ChildAssessmentAnswer;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Teacher;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.ChildStatus;
import com.rafeeq.backend.repository.AssessmentQuestionRepository;
import com.rafeeq.backend.repository.ChildAssessmentAnswerRepository;
import com.rafeeq.backend.repository.ChildAssessmentRepository;
import com.rafeeq.backend.repository.ChildProfileRepository;
import com.rafeeq.backend.repository.TeacherRepository;
import com.rafeeq.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlacementAssessmentService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final ChildProfileRepository childProfileRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final ChildAssessmentRepository childAssessmentRepository;
    private final ChildAssessmentAnswerRepository childAssessmentAnswerRepository;

    public PlacementAssessmentResponse getPlacementAssessment(UUID childId, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);
        ChildProfile child = childProfileRepository.findByIdAndTeacherId(childId, teacher.getId())
                .orElseThrow(() -> new NotFoundException("Student not found"));

        List<AssessmentQuestion> questions = assessmentQuestionRepository.findAllByOrderByLevelAscOrderNumAsc();
        if (questions.isEmpty()) {
            throw new NotFoundException("Placement question bank is empty");
        }

        return new PlacementAssessmentResponse(
                child.getId(),
                child.getFullNameAr() != null ? child.getFullNameAr() : child.getFullNameEn(),
                child.getStatus() != null ? child.getStatus().name() : null,
                child.getPlacementCompletedAt() != null,
                questions.stream().map(this::mapQuestion).toList()
        );
    }

    @Transactional
    public PlacementSubmissionResponse submitPlacement(UUID childId, SubmitPlacementRequest request, String nationalId) {
        Teacher teacher = getCurrentTeacher(nationalId);
        ChildProfile child = childProfileRepository.findByIdAndTeacherId(childId, teacher.getId())
                .orElseThrow(() -> new NotFoundException("Student not found"));

        if (child.getPlacementCompletedAt() != null || child.getStatus() == ChildStatus.ACTIVE) {
            throw new BadRequestException("Placement exam has already been completed for this child");
        }

        List<AssessmentQuestion> questions = assessmentQuestionRepository.findAllByOrderByLevelAscOrderNumAsc();
        if (questions.isEmpty()) {
            throw new NotFoundException("Placement question bank is empty");
        }

        Map<UUID, AssessmentQuestion> questionsById = questions.stream()
                .collect(java.util.stream.Collectors.toMap(AssessmentQuestion::getId, question -> question));

        if (request.getAnswers().size() != questions.size()) {
            throw new BadRequestException("Placement exam answers must match the full question set");
        }

        Set<UUID> submittedQuestionIds = new HashSet<>();
        int correctAnswers = 0;

        ChildAssessment assessment = new ChildAssessment();
        assessment.setChild(child);
        assessment.setTeacher(teacher);

        List<ChildAssessmentAnswer> answers = new ArrayList<>();
        for (var answerRequest : request.getAnswers()) {
            AssessmentQuestion question = questionsById.get(answerRequest.getQuestionId());
            if (question == null) {
                throw new BadRequestException("Placement answer contains an unknown question");
            }

            if (!submittedQuestionIds.add(question.getId())) {
                throw new BadRequestException("Placement answer contains duplicate questions");
            }

            boolean isCorrect = Objects.equals(question.getCorrectOption(), answerRequest.getSelectedOption());
            if (isCorrect) {
                correctAnswers++;
            }

            ChildAssessmentAnswer answer = new ChildAssessmentAnswer();
            answer.setAssessment(assessment);
            answer.setQuestion(question);
            answer.setSelectedOption(answerRequest.getSelectedOption());
            answer.setIsCorrect(isCorrect);
            answers.add(answer);
        }

        int resultLevel = determineLevel(correctAnswers, questions.size());
        assessment.setResultLevel(resultLevel);
        childAssessmentRepository.save(assessment);
        childAssessmentAnswerRepository.saveAll(answers);

        child.setAssessedLevel(resultLevel);
        child.setLevel(resultLevel);
        child.setStatus(ChildStatus.ACTIVE);
        child.setPlacementCompletedAt(LocalDateTime.now());
        if (child.getUser() != null) {
            child.getUser().setIsActive(true);
        }

        int confidencePercentage = (int) Math.round((correctAnswers * 100.0) / questions.size());

        return new PlacementSubmissionResponse(
                child.getId(),
                assessment.getId(),
                resultLevel,
                correctAnswers,
                questions.size(),
                confidencePercentage,
                child.getLearningDifficulty() != null ? child.getLearningDifficulty().name() : null,
                child.getStatus().name(),
                child.getUser() != null && Boolean.TRUE.equals(child.getUser().getIsActive()),
                child.getPlacementCompletedAt()
        );
    }

    private Teacher getCurrentTeacher(String nationalId) {
        User user = userRepository.findByNationalId(nationalId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("Teacher not found"));
    }

    private int determineLevel(int correctAnswers, int totalQuestions) {
        double score = totalQuestions == 0 ? 0 : (correctAnswers * 100.0) / totalQuestions;
        if (score >= 80) {
            return 3;
        }
        if (score >= 50) {
            return 2;
        }
        return 1;
    }

    private PlacementQuestionResponse mapQuestion(AssessmentQuestion question) {
        return new PlacementQuestionResponse(
                question.getId(),
                question.getOrderNum(),
                question.getLevel(),
                question.getPoints(),
                question.getArabicContent() != null ? question.getArabicContent().getQuestionText() : null,
                question.getEnglishContent() != null ? question.getEnglishContent().getQuestionText() : null,
                Arrays.asList(
                        question.getArabicContent() != null ? question.getArabicContent().getOption1() : null,
                        question.getArabicContent() != null ? question.getArabicContent().getOption2() : null,
                        question.getArabicContent() != null ? question.getArabicContent().getOption3() : null,
                        question.getArabicContent() != null ? question.getArabicContent().getOption4() : null
                ),
                Arrays.asList(
                        question.getEnglishContent() != null ? question.getEnglishContent().getOption1() : null,
                        question.getEnglishContent() != null ? question.getEnglishContent().getOption2() : null,
                        question.getEnglishContent() != null ? question.getEnglishContent().getOption3() : null,
                        question.getEnglishContent() != null ? question.getEnglishContent().getOption4() : null
                )
        );
    }
}
