package com.rafeeq.backend.service;

import com.rafeeq.backend.common.BadRequestException;
import com.rafeeq.backend.common.LanguageUtil;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.common.UnauthorizedException;
import com.rafeeq.backend.dto.learning.TreeItemCompletionResponse;
import com.rafeeq.backend.dto.quiz.QuizAnswerSubmissionRequest;
import com.rafeeq.backend.dto.quiz.QuizQuestionResponse;
import com.rafeeq.backend.dto.quiz.QuizResponse;
import com.rafeeq.backend.dto.quiz.QuizSubmissionResponse;
import com.rafeeq.backend.dto.quiz.SubmitQuizRequest;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Quiz;
import com.rafeeq.backend.entity.QuizAnswer;
import com.rafeeq.backend.entity.QuizQuestion;
import com.rafeeq.backend.entity.TreeItem;
import com.rafeeq.backend.entity.User;
import com.rafeeq.backend.entity_enums.UserRole;
import com.rafeeq.backend.repository.QuizAnswerRepository;
import com.rafeeq.backend.repository.QuizQuestionRepository;
import com.rafeeq.backend.repository.QuizRepository;
import com.rafeeq.backend.repository.TreeItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final TreeItemRepository treeItemRepository;
    private final AccessService accessService;
    private final LearningTreeService learningTreeService;

    public List<QuizResponse> getQuizzes(UUID childId, String nationalId, String acceptLanguage) {
        ChildProfile child = accessService.getAccessibleChild(childId, nationalId);

        return quizRepository.findByChildId(child.getId())
                .stream()
                .sorted(Comparator.comparing(quiz -> resolveTreeItem(quiz).map(TreeItem::getOrderNum).orElse(Integer.MAX_VALUE)))
                .map(quiz -> map(quiz, acceptLanguage, false))
                .toList();
    }

    public QuizResponse getQuiz(UUID quizId, String nationalId, String acceptLanguage) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NotFoundException("Quiz not found"));
        accessService.getAccessibleChild(quiz.getChild().getId(), nationalId);
        return map(quiz, acceptLanguage, true);
    }

    @Transactional
    public QuizSubmissionResponse submitQuiz(UUID quizId, SubmitQuizRequest request, String nationalId) {
        ensureLearnerCanMutate(nationalId);

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new NotFoundException("Quiz not found"));
        accessService.getAccessibleChild(quiz.getChild().getId(), nationalId);

        TreeItem treeItem = resolveTreeItem(quiz).orElse(null);
        if (treeItem != null) {
            if (Boolean.TRUE.equals(treeItem.getIsLocked())) {
                throw new BadRequestException("Quiz step is locked");
            }
            if (Boolean.TRUE.equals(treeItem.getIsCompleted())) {
                throw new BadRequestException("Quiz step is already completed");
            }
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByOrderNumAsc(quiz.getId());
        if (questions.isEmpty()) {
            throw new BadRequestException("Quiz has no questions");
        }
        if (request.getAnswers() == null || request.getAnswers().size() != questions.size()) {
            throw new BadRequestException("Quiz answers must match the full question set");
        }

        Map<UUID, QuizQuestion> questionsById = questions.stream()
                .collect(Collectors.toMap(QuizQuestion::getId, question -> question));
        Set<UUID> submittedQuestionIds = new HashSet<>();
        List<QuizAnswer> answerEntities = new ArrayList<>();
        int correctAnswers = 0;

        for (QuizAnswerSubmissionRequest answerRequest : request.getAnswers()) {
            QuizQuestion question = questionsById.get(answerRequest.getQuestionId());
            if (question == null) {
                throw new BadRequestException("Quiz answer contains an unknown question");
            }
            if (!submittedQuestionIds.add(question.getId())) {
                throw new BadRequestException("Quiz answer contains duplicate questions");
            }

            int selectedOption = parseSelectedOption(answerRequest.getSelectedOption());
            boolean isCorrect = question.getCorrectOption() != null && question.getCorrectOption() == selectedOption;
            if (isCorrect) {
                correctAnswers++;
            }

            QuizAnswer answer = new QuizAnswer();
            answer.setQuiz(quiz);
            answer.setQuestion(question);
            answer.setSelectedOption(selectedOption);
            answer.setIsCorrect(isCorrect);
            answerEntities.add(answer);
        }

        quizAnswerRepository.deleteByQuizId(quiz.getId());
        quizAnswerRepository.saveAll(answerEntities);

        LocalDateTime completedAt = LocalDateTime.now();
        int totalQuestions = questions.size();
        int score = correctAnswers;
        quiz.setTotalQuestions(totalQuestions);
        quiz.setScore(score);
        quiz.setStatus("completed");
        quiz.setCompletedAt(completedAt);
        if (quiz.getStartedAt() == null) {
            quiz.setStartedAt(completedAt);
        }
        quizRepository.save(quiz);

        TreeItemCompletionResponse completion = null;
        if (treeItem != null) {
            completion = learningTreeService.completeItem(treeItem.getId(), nationalId);
        }

        return new QuizSubmissionResponse(
                quiz.getId(),
                quiz.getTree() != null ? quiz.getTree().getId() : completion != null ? completion.getTreeId() : null,
                treeItem != null ? treeItem.getId() : null,
                score,
                correctAnswers,
                totalQuestions,
                completion != null ? completion.getProgressPercentage() : null,
                completion != null && completion.isTreeCompleted(),
                completion != null ? completion.getCompletedItems() : null,
                completion != null ? completion.getTotalItems() : null,
                completion != null ? completion.getTreeStatus() : quiz.getStatus()
        );
    }

    private void ensureLearnerCanMutate(String nationalId) {
        User user = accessService.getCurrentUser(nationalId);
        if (user.getRole() != UserRole.PARENT && user.getRole() != UserRole.CHILD) {
            throw new UnauthorizedException("Only parent or child users can submit quizzes");
        }
    }

    private int parseSelectedOption(String selectedOption) {
        if (selectedOption == null || selectedOption.isBlank()) {
            throw new BadRequestException("Selected option is required");
        }

        return switch (selectedOption.trim().toUpperCase(Locale.ROOT)) {
            case "A", "1" -> 1;
            case "B", "2" -> 2;
            case "C", "3" -> 3;
            case "D", "4" -> 4;
            default -> throw new BadRequestException("Selected option must be A, B, C, or D");
        };
    }

    private QuizResponse map(Quiz quiz, String acceptLanguage, boolean includeQuestions) {
        TreeItem treeItem = resolveTreeItem(quiz).orElse(null);
        List<QuizQuestionResponse> questions = includeQuestions
                ? quizQuestionRepository.findByQuizIdOrderByOrderNumAsc(quiz.getId()).stream()
                .map(question -> mapQuestion(question, acceptLanguage))
                .toList()
                : List.of();

        return new QuizResponse(
                quiz.getId(),
                quiz.getChild().getId(),
                quiz.getTree() != null ? quiz.getTree().getId() : null,
                treeItem != null ? treeItem.getId() : null,
                buildQuizTitle(quiz, treeItem, acceptLanguage),
                quiz.getLevel(),
                quiz.getTotalQuestions(),
                quiz.getScore(),
                quiz.getStatus(),
                treeItem != null ? treeItem.getGroupNumber() : null,
                treeItem != null ? treeItem.getOrderNum() : null,
                quiz.getStartedAt(),
                quiz.getCompletedAt(),
                questions
        );
    }

    private QuizQuestionResponse mapQuestion(QuizQuestion question, String acceptLanguage) {
        boolean arabic = LanguageUtil.isArabic(acceptLanguage);

        List<String> options = arabic
                ? java.util.Arrays.asList(
                safeText(LanguageUtil.firstNonBlank(question.getOption1Ar(), question.getOption1())),
                safeText(LanguageUtil.firstNonBlank(question.getOption2Ar(), question.getOption2())),
                safeText(LanguageUtil.firstNonBlank(question.getOption3Ar(), question.getOption3())),
                safeText(LanguageUtil.firstNonBlank(question.getOption4Ar(), question.getOption4()))
        )
                : java.util.Arrays.asList(
                safeText(LanguageUtil.firstNonBlank(question.getOption1(), question.getOption1Ar())),
                safeText(LanguageUtil.firstNonBlank(question.getOption2(), question.getOption2Ar())),
                safeText(LanguageUtil.firstNonBlank(question.getOption3(), question.getOption3Ar())),
                safeText(LanguageUtil.firstNonBlank(question.getOption4(), question.getOption4Ar()))
        );

        return new QuizQuestionResponse(
                question.getId(),
                arabic
                        ? LanguageUtil.firstNonBlank(question.getQuestionAr(), LanguageUtil.firstNonBlank(question.getQuestionEn(), question.getQuestion()))
                        : LanguageUtil.firstNonBlank(LanguageUtil.firstNonBlank(question.getQuestionEn(), question.getQuestion()), question.getQuestionAr()),
                options,
                question.getCorrectOption(),
                LanguageUtil.pick(acceptLanguage, question.getExplanationAr(), question.getExplanationEn()),
                question.getOrderNum(),
                question.getPoints()
        );
    }

    private String safeText(String value) {
        return value != null ? value : "";
    }

    private java.util.Optional<TreeItem> resolveTreeItem(Quiz quiz) {
        return treeItemRepository.findFirstByItemId(quiz.getId());
    }

    private String buildQuizTitle(Quiz quiz, TreeItem treeItem, String acceptLanguage) {
        if (treeItem != null && treeItem.getItemType() != null && "final_quiz".equalsIgnoreCase(treeItem.getItemType())) {
            return LanguageUtil.isArabic(acceptLanguage) ? "الاختبار النهائي" : "Final Quiz";
        }

        Integer groupNumber = treeItem != null ? treeItem.getGroupNumber() : null;
        if (groupNumber != null && groupNumber > 0) {
            return LanguageUtil.isArabic(acceptLanguage)
                    ? "اختبار المجموعة " + groupNumber
                    : "Group " + groupNumber + " Quiz";
        }

        return LanguageUtil.isArabic(acceptLanguage)
                ? "اختبار المستوى " + (quiz.getLevel() != null ? quiz.getLevel() : "")
                : "Level " + (quiz.getLevel() != null ? quiz.getLevel() : "") + " Quiz";
    }
}
