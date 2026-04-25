package com.rafeeq.backend.service;

import com.rafeeq.backend.common.LanguageUtil;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.dto.quiz.QuizQuestionResponse;
import com.rafeeq.backend.dto.quiz.QuizResponse;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.Quiz;
import com.rafeeq.backend.entity.QuizQuestion;
import com.rafeeq.backend.entity.TreeItem;
import com.rafeeq.backend.repository.QuizQuestionRepository;
import com.rafeeq.backend.repository.QuizRepository;
import com.rafeeq.backend.repository.TreeItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final TreeItemRepository treeItemRepository;
    private final AccessService accessService;

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
