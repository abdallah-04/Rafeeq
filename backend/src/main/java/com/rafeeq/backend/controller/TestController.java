package com.rafeeq.backend.controller;

import com.rafeeq.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class TestController {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final TeacherRepository teacherRepository;
    private final SchoolRepository schoolRepository;
    private final ChildProfileRepository childProfileRepository;

    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final AssessmentQuestionArRepository assessmentQuestionArRepository;
    private final AssessmentQuestionEnRepository assessmentQuestionEnRepository;
    private final ChildAssessmentRepository childAssessmentRepository;
    private final ChildAssessmentAnswerRepository childAssessmentAnswerRepository;

    private final ContentTypeRepository contentTypeRepository;
    private final LearningTreeRepository learningTreeRepository;
    private final TreeItemRepository treeItemRepository;
    private final ChildScoreRepository childScoreRepository;
    private final ChildScoreLogRepository childScoreLogRepository;

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final HomeworkRepository homeworkRepository;
    private final ActivityRepository activityRepository;

    private final NotificationTypeRepository notificationTypeRepository;
    private final NotificationRepository notificationRepository;
    private final ChatbotSessionRepository chatbotSessionRepository;
    private final ChatbotMessageRepository chatbotMessageRepository;
    private final ArticleRepository articleRepository;
    private final SavedArticleRepository savedArticleRepository;

    @GetMapping("/test/db")
    public Map<String, Object> testDb() {
        return Map.ofEntries(
                Map.entry("users", userRepository.count()),
                Map.entry("parents", parentRepository.count()),
                Map.entry("teachers", teacherRepository.count()),
                Map.entry("schools", schoolRepository.count()),
                Map.entry("childProfiles", childProfileRepository.count()),

                Map.entry("assessmentQuestions", assessmentQuestionRepository.count()),
                Map.entry("assessmentQuestionsAr", assessmentQuestionArRepository.count()),
                Map.entry("assessmentQuestionsEn", assessmentQuestionEnRepository.count()),
                Map.entry("childAssessments", childAssessmentRepository.count()),
                Map.entry("childAssessmentAnswers", childAssessmentAnswerRepository.count()),

                Map.entry("contentTypes", contentTypeRepository.count()),
                Map.entry("learningTrees", learningTreeRepository.count()),
                Map.entry("treeItems", treeItemRepository.count()),
                Map.entry("childScores", childScoreRepository.count()),
                Map.entry("childScoreLogs", childScoreLogRepository.count()),

                Map.entry("quizzes", quizRepository.count()),
                Map.entry("quizQuestions", quizQuestionRepository.count()),
                Map.entry("quizAnswers", quizAnswerRepository.count()),
                Map.entry("homeworks", homeworkRepository.count()),
                Map.entry("activities", activityRepository.count()),

                Map.entry("notificationTypes", notificationTypeRepository.count()),
                Map.entry("notifications", notificationRepository.count()),
                Map.entry("chatbotSessions", chatbotSessionRepository.count()),
                Map.entry("chatbotMessages", chatbotMessageRepository.count()),
                Map.entry("articles", articleRepository.count()),
                Map.entry("savedArticles", savedArticleRepository.count())
        );
    }

    @GetMapping("/test/ping")
    public String ping() {
        return "RAFEEQ test controller is running";
    }
}