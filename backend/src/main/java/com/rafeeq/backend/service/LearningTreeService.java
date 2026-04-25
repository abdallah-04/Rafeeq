package com.rafeeq.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rafeeq.backend.common.LanguageUtil;
import com.rafeeq.backend.common.NotFoundException;
import com.rafeeq.backend.common.ServiceUnavailableException;
import com.rafeeq.backend.dto.learning.LearningTreeResponse;
import com.rafeeq.backend.dto.learning.TreeItemCompletionResponse;
import com.rafeeq.backend.dto.learning.TreeItemResponse;
import com.rafeeq.backend.entity.Activity;
import com.rafeeq.backend.entity.ChildProfile;
import com.rafeeq.backend.entity.ContentType;
import com.rafeeq.backend.entity.Homework;
import com.rafeeq.backend.entity.LearningTree;
import com.rafeeq.backend.entity.Quiz;
import com.rafeeq.backend.entity.QuizQuestion;
import com.rafeeq.backend.entity.Topic;
import com.rafeeq.backend.entity.TreeItem;
import com.rafeeq.backend.repository.ActivityRepository;
import com.rafeeq.backend.repository.ContentTypeRepository;
import com.rafeeq.backend.repository.HomeworkRepository;
import com.rafeeq.backend.repository.LearningTreeRepository;
import com.rafeeq.backend.repository.QuizQuestionRepository;
import com.rafeeq.backend.repository.QuizRepository;
import com.rafeeq.backend.repository.TopicRepository;
import com.rafeeq.backend.repository.TreeItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LearningTreeService {

    private static final String TREE_STATUS_ACTIVE = "active";
    private static final String TREE_STATUS_COMPLETED = "completed";
    private static final String TREE_STATUS_ARCHIVED = "archived";
    private static final String ITEM_STATUS_PENDING = "pending";
    private static final String ITEM_STATUS_COMPLETED = "completed";
    private static final String HOMEWORK_STATUS_SUBMITTED = "submitted";
    private static final int HOMEWORK_CONTENT_TYPE = 1;
    private static final int QUIZ_CONTENT_TYPE = 2;
    private static final int ACTIVITY_CONTENT_TYPE = 3;

    private final AccessService accessService;
    private final OpenAiService openAiService;
    private final LearningTreeRepository learningTreeRepository;
    private final TreeItemRepository treeItemRepository;
    private final ActivityRepository activityRepository;
    private final HomeworkRepository homeworkRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ContentTypeRepository contentTypeRepository;
    private final TopicRepository topicRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public LearningTreeResponse getActiveTree(UUID childId, String nationalId, String acceptLanguage) {
        ChildProfile child = accessService.getAccessibleChild(childId, nationalId);
        LearningTree tree = learningTreeRepository.findFirstByChildIdAndStatusOrderByGeneratedAtDesc(child.getId(), TREE_STATUS_ACTIVE)
                .orElseThrow(() -> new NotFoundException("No active learning tree found"));
        return mapTree(tree, acceptLanguage);
    }

    @Transactional(readOnly = true)
    public List<TreeItemResponse> getTreeItems(UUID childId, String nationalId, String acceptLanguage) {
        ChildProfile child = accessService.getAccessibleChild(childId, nationalId);
        LearningTree tree = learningTreeRepository.findFirstByChildIdAndStatusOrderByGeneratedAtDesc(child.getId(), TREE_STATUS_ACTIVE)
                .orElseThrow(() -> new NotFoundException("No active learning tree found"));

        return treeItemRepository.findByTreeIdOrderByOrderNumAsc(tree.getId())
                .stream()
                .map(item -> mapTreeItem(item, acceptLanguage))
                .toList();
    }

    @Transactional
    public LearningTreeResponse generateTree(UUID childId, UUID topicId, String nationalId, String acceptLanguage) {
        ChildProfile child = accessService.getAccessibleChild(childId, nationalId);
        LearningTree tree = generateTreeForChild(child, topicId);
        return mapTree(tree, acceptLanguage);
    }

    @Transactional
    public void generateTreeAfterPlacement(ChildProfile child) {
        generateTreeForChild(child, null);
    }

    @Transactional
    public TreeItemCompletionResponse completeItem(UUID itemId, String nationalId) {
        TreeItem item = treeItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Tree item not found"));

        accessService.getAccessibleChild(item.getTree().getChild().getId(), nationalId);

        if (!Boolean.TRUE.equals(item.getIsCompleted())) {
            item.setIsCompleted(true);
            item.setIsLocked(false);
            item.setStatus(ITEM_STATUS_COMPLETED);
            item.setCompletedAt(LocalDateTime.now());
            item.setEarnedPoints(item.getMaxPoints() != null ? item.getMaxPoints() : item.getEarnedPoints());
            treeItemRepository.save(item);
            updateLinkedContentStatus(item);
        }

        List<TreeItem> items = treeItemRepository.findByTreeIdOrderByOrderNumAsc(item.getTree().getId());
        unlockNextItem(items, item.getId());

        long completedItems = items.stream().filter(treeItem -> Boolean.TRUE.equals(treeItem.getIsCompleted())).count();
        int totalItems = items.size();
        boolean treeCompleted = totalItems > 0 && completedItems == totalItems;

        LearningTree tree = item.getTree();
        tree.setStatus(treeCompleted ? TREE_STATUS_COMPLETED : TREE_STATUS_ACTIVE);
        learningTreeRepository.save(tree);

        int progressPercentage = totalItems == 0
                ? 0
                : (int) Math.round((completedItems * 100.0) / totalItems);

        return new TreeItemCompletionResponse(
                tree.getId(),
                item.getId(),
                treeCompleted,
                (int) completedItems,
                totalItems,
                progressPercentage,
                tree.getStatus()
        );
    }

    @Transactional
    protected LearningTree generateTreeForChild(ChildProfile child, UUID topicId) {
        Integer level = child.getAssessedLevel() != null ? child.getAssessedLevel() : child.getLevel();
        if (level == null) {
            throw new NotFoundException("Child level is not available yet");
        }

        Topic topic = resolveTopic(topicId, level);
        JsonNode root = requestLearningTree(child, topic, level);

        archiveCurrentTrees(child.getId());

        LearningTree tree = new LearningTree();
        tree.setChild(child);
        tree.setLevel(level);
        tree.setTopic(LanguageUtil.firstNonBlank(topic.getNameAr(), topic.getNameEn()));
        tree.setTopicRef(topic);
        tree.setStatus(TREE_STATUS_ACTIVE);
        tree.setAiSummaryAr(readText(root, "summary_ar"));
        tree.setAiSummaryEn(readText(root, "summary_en"));
        tree.setModelUsed(openAiService.getModelName());
        tree.setPromptVersion("local-merge-2026-04-25");
        learningTreeRepository.save(tree);

        JsonNode groups = root.path("groups");
        if (!groups.isArray() || groups.isEmpty()) {
            throw new ServiceUnavailableException("OpenAI returned an invalid learning tree structure.");
        }

        int orderNum = 1;
        for (int i = 0; i < groups.size(); i++) {
            JsonNode groupNode = groups.get(i);
            int groupNumber = groupNode.path("group_number").asInt(i + 1);

            Activity activity = createActivity(groupNode.path("activity"), child, tree, groupNumber, orderNum);
            TreeItem activityItem = createTreeItem(tree, ACTIVITY_CONTENT_TYPE, activity.getId(), "activity", groupNumber, orderNum, orderNum != 1, 10);
            activity.setTreeItemId(activityItem.getId());
            activityRepository.save(activity);
            orderNum++;

            Homework homework = createHomework(groupNode.path("homework"), child, tree, groupNumber, orderNum);
            TreeItem homeworkItem = createTreeItem(tree, HOMEWORK_CONTENT_TYPE, homework.getId(), "homework", groupNumber, orderNum, true, 10);
            homework.setTreeItemId(homeworkItem.getId());
            homeworkRepository.save(homework);
            orderNum++;

            Quiz quiz = createQuiz(groupNode.path("quiz"), child, tree, level, groupNumber, orderNum);
            TreeItem quizItem = createTreeItem(tree, QUIZ_CONTENT_TYPE, quiz.getId(), "quiz", groupNumber, orderNum, true, Math.max(quiz.getTotalQuestions() != null ? quiz.getTotalQuestions() * 10 : 30, 10));
            treeItemRepository.save(quizItem);
            orderNum++;
        }

        return tree;
    }

    private JsonNode requestLearningTree(ChildProfile child, Topic topic, Integer level) {
        try {
            int age = child.getDateOfBirth() != null
                    ? Math.max(3, Period.between(child.getDateOfBirth(), LocalDate.now()).getYears())
                    : 6;

            String childName = LanguageUtil.firstNonBlank(child.getFullNameAr(), child.getFullNameEn());
            String difficulty = child.getLearningDifficulty() != null ? child.getLearningDifficulty().name() : "NONE";

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of(
                    "role", "system",
                    "content", "You create bilingual Arabic and English learning plans for children. " +
                            "Return valid JSON only, with no markdown, no commentary, and no code fences."
            ));
            messages.add(Map.of(
                    "role", "user",
                    "content", buildLearningTreePrompt(childName, age, level, difficulty, topic)
            ));

            String content = openAiService.chat(messages, 0.7, 2800);
            return objectMapper.readTree(extractJson(content));
        } catch (ServiceUnavailableException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ServiceUnavailableException("Learning tree generation failed. Please try again.");
        }
    }

    private String buildLearningTreePrompt(String childName, int age, int level, String difficulty, Topic topic) {
        return """
                Create a bilingual Arabic and English learning tree for one child.

                Child name: %s
                Age: %d
                Level: %d
                Learning difficulty: %s
                Topic Arabic: %s
                Topic English: %s

                Rules:
                - Return valid JSON only.
                - Keep text simple, supportive, and age appropriate.
                - Produce exactly 3 groups.
                - Each group must include one activity, one homework, and one quiz.
                - Each quiz must include exactly 3 questions.
                - Always include both Arabic and English content for every text field.

                JSON shape:
                {
                  "summary_ar": "string",
                  "summary_en": "string",
                  "groups": [
                    {
                      "group_number": 1,
                      "activity": {
                        "title_ar": "string",
                        "title_en": "string",
                        "description_ar": "string",
                        "description_en": "string",
                        "activity_task_ar": "string",
                        "activity_task_en": "string",
                        "parent_guide_ar": "string",
                        "parent_guide_en": "string",
                        "materials_needed_ar": "string",
                        "materials_needed_en": "string",
                        "expected_outcome_ar": "string",
                        "expected_outcome_en": "string"
                      },
                      "homework": {
                        "title_ar": "string",
                        "title_en": "string",
                        "description_ar": "string",
                        "description_en": "string"
                      },
                      "quiz": {
                        "questions": [
                          {
                            "question_ar": "string",
                            "question_en": "string",
                            "option_1_ar": "string",
                            "option_1": "string",
                            "option_2_ar": "string",
                            "option_2": "string",
                            "option_3_ar": "string",
                            "option_3": "string",
                            "option_4_ar": "string",
                            "option_4": "string",
                            "correct_option": 1,
                            "explanation_ar": "string",
                            "explanation_en": "string"
                          }
                        ]
                      }
                    }
                  ]
                }
                """.formatted(
                childName,
                age,
                level,
                difficulty,
                LanguageUtil.firstNonBlank(topic.getNameAr(), topic.getNameEn()),
                LanguageUtil.firstNonBlank(topic.getNameEn(), topic.getNameAr())
        );
    }

    private String extractJson(String content) {
        String trimmed = content.trim();
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }

    private Topic resolveTopic(UUID topicId, Integer level) {
        if (topicId != null) {
            return topicRepository.findById(topicId)
                    .orElseThrow(() -> new NotFoundException("Topic not found"));
        }

        return topicRepository.findFirstByLevelOrderByOrderNumAsc(Math.max(1, Math.min(level, 5)))
                .orElseThrow(() -> new NotFoundException("No topic is configured for this level"));
    }

    private void archiveCurrentTrees(UUID childId) {
        List<LearningTree> activeTrees = learningTreeRepository.findByChildIdAndStatus(childId, TREE_STATUS_ACTIVE);
        for (LearningTree activeTree : activeTrees) {
            activeTree.setStatus(TREE_STATUS_ARCHIVED);
        }
        learningTreeRepository.saveAll(activeTrees);
    }

    private Activity createActivity(JsonNode node, ChildProfile child, LearningTree tree, int groupNumber, int orderNum) {
        Activity activity = new Activity();
        activity.setChild(child);
        activity.setTree(tree);
        activity.setTitleAr(readText(node, "title_ar"));
        activity.setTitleEn(readText(node, "title_en"));
        activity.setDescriptionAr(readText(node, "description_ar"));
        activity.setDescriptionEn(readText(node, "description_en"));
        activity.setActivityTaskAr(readText(node, "activity_task_ar"));
        activity.setActivityTaskEn(readText(node, "activity_task_en"));
        activity.setParentGuideAr(readText(node, "parent_guide_ar"));
        activity.setParentGuideEn(readText(node, "parent_guide_en"));
        activity.setInstructionsAr(readText(node, "activity_task_ar"));
        activity.setInstructionsEn(readText(node, "activity_task_en"));
        activity.setMaterialsNeededAr(readText(node, "materials_needed_ar"));
        activity.setMaterialsNeededEn(readText(node, "materials_needed_en"));
        activity.setExpectedOutcomeAr(readText(node, "expected_outcome_ar"));
        activity.setExpectedOutcomeEn(readText(node, "expected_outcome_en"));
        activity.setGroupNumber(groupNumber);
        activity.setOrderNum(orderNum);
        activity.setStatus(ITEM_STATUS_PENDING);
        return activityRepository.save(activity);
    }

    private Homework createHomework(JsonNode node, ChildProfile child, LearningTree tree, int groupNumber, int orderNum) {
        Homework homework = new Homework();
        homework.setChild(child);
        homework.setTree(tree);
        homework.setTitleAr(readText(node, "title_ar"));
        homework.setTitleEn(readText(node, "title_en"));
        homework.setDescriptionAr(readText(node, "description_ar"));
        homework.setDescriptionEn(readText(node, "description_en"));
        homework.setGroupNumber(groupNumber);
        homework.setOrderNum(orderNum);
        homework.setStartDate(LocalDate.now());
        homework.setDueDate(LocalDate.now().plusDays(7));
        homework.setStatus(ITEM_STATUS_PENDING);
        return homeworkRepository.save(homework);
    }

    private Quiz createQuiz(JsonNode node, ChildProfile child, LearningTree tree, int level, int groupNumber, int orderNum) {
        Quiz quiz = new Quiz();
        quiz.setChild(child);
        quiz.setTree(tree);
        quiz.setLevel(level);
        quiz.setStatus(ITEM_STATUS_PENDING);
        quiz.setTotalQuestions(node.path("questions").isArray() ? node.path("questions").size() : 0);
        quizRepository.save(quiz);

        JsonNode questions = node.path("questions");
        for (int i = 0; i < questions.size(); i++) {
            JsonNode questionNode = questions.get(i);
            QuizQuestion question = new QuizQuestion();
            question.setQuiz(quiz);
            question.setQuestion(readText(questionNode, "question_en"));
            question.setQuestionEn(readText(questionNode, "question_en"));
            question.setQuestionAr(readText(questionNode, "question_ar"));
            question.setOption1(readText(questionNode, "option_1"));
            question.setOption2(readText(questionNode, "option_2"));
            question.setOption3(readText(questionNode, "option_3"));
            question.setOption4(readText(questionNode, "option_4"));
            question.setOption1Ar(readText(questionNode, "option_1_ar"));
            question.setOption2Ar(readText(questionNode, "option_2_ar"));
            question.setOption3Ar(readText(questionNode, "option_3_ar"));
            question.setOption4Ar(readText(questionNode, "option_4_ar"));
            question.setCorrectOption(questionNode.path("correct_option").asInt(1));
            question.setExplanationAr(readText(questionNode, "explanation_ar"));
            question.setExplanationEn(readText(questionNode, "explanation_en"));
            question.setOrderNum(i + 1);
            question.setPoints(10);
            quizQuestionRepository.save(question);
        }

        return quiz;
    }

    private TreeItem createTreeItem(
            LearningTree tree,
            int contentTypeId,
            UUID itemId,
            String itemType,
            int groupNumber,
            int orderNum,
            boolean locked,
            int maxPoints
    ) {
        ContentType contentType = contentTypeRepository.findById(contentTypeId)
                .orElseThrow(() -> new NotFoundException("Content type not found"));

        TreeItem item = new TreeItem();
        item.setTree(tree);
        item.setContentType(contentType);
        item.setItemId(itemId);
        item.setItemType(itemType);
        item.setGroupNumber(groupNumber);
        item.setOrderNum(orderNum);
        item.setIsLocked(locked);
        item.setIsCompleted(false);
        item.setStatus(ITEM_STATUS_PENDING);
        item.setMaxPoints(maxPoints);
        item.setEarnedPoints(0);
        return treeItemRepository.save(item);
    }

    private void updateLinkedContentStatus(TreeItem item) {
        LocalDateTime completedAt = item.getCompletedAt() != null ? item.getCompletedAt() : LocalDateTime.now();
        String itemType = item.getItemType() != null ? item.getItemType().toLowerCase() : "";

        if ("activity".equals(itemType)) {
            activityRepository.findById(item.getItemId()).ifPresent(activity -> {
                activity.setStatus(ITEM_STATUS_COMPLETED);
                activity.setCompletedAt(completedAt);
                activityRepository.save(activity);
            });
            return;
        }

        if ("homework".equals(itemType)) {
            homeworkRepository.findById(item.getItemId()).ifPresent(homework -> {
                homework.setStatus(HOMEWORK_STATUS_SUBMITTED);
                homework.setSubmittedAt(completedAt);
                homeworkRepository.save(homework);
            });
            return;
        }

        if ("quiz".equals(itemType) || "final_quiz".equals(itemType)) {
            quizRepository.findById(item.getItemId()).ifPresent(quiz -> {
                quiz.setStatus(ITEM_STATUS_COMPLETED);
                quiz.setCompletedAt(completedAt);
                quizRepository.save(quiz);
            });
        }
    }

    private void unlockNextItem(List<TreeItem> items, UUID currentItemId) {
        for (int i = 0; i < items.size(); i++) {
            TreeItem candidate = items.get(i);
            if (!candidate.getId().equals(currentItemId)) {
                continue;
            }
            if (i + 1 < items.size()) {
                TreeItem nextItem = items.get(i + 1);
                if (Boolean.TRUE.equals(nextItem.getIsLocked())) {
                    nextItem.setIsLocked(false);
                    treeItemRepository.save(nextItem);
                }
            }
            break;
        }
    }

    private LearningTreeResponse mapTree(LearningTree tree, String acceptLanguage) {
        String topic = tree.getTopicRef() != null
                ? LanguageUtil.pick(acceptLanguage, tree.getTopicRef().getNameAr(), tree.getTopicRef().getNameEn())
                : tree.getTopic();

        return new LearningTreeResponse(
                tree.getId(),
                tree.getChild().getId(),
                tree.getLevel(),
                topic,
                tree.getTopicRef() != null ? tree.getTopicRef().getId() : null,
                LanguageUtil.pick(acceptLanguage, tree.getAiSummaryAr(), tree.getAiSummaryEn()),
                tree.getStatus(),
                tree.getGeneratedAt()
        );
    }

    private TreeItemResponse mapTreeItem(TreeItem item, String acceptLanguage) {
        String title = null;
        String description = null;
        String itemType = item.getItemType() != null ? item.getItemType() : "item";

        if ("activity".equalsIgnoreCase(itemType)) {
            Activity activity = activityRepository.findById(item.getItemId()).orElse(null);
            if (activity != null) {
                title = LanguageUtil.pick(acceptLanguage, activity.getTitleAr(), activity.getTitleEn());
                description = LanguageUtil.pick(acceptLanguage, activity.getDescriptionAr(), activity.getDescriptionEn());
            }
        } else if ("homework".equalsIgnoreCase(itemType)) {
            Homework homework = homeworkRepository.findById(item.getItemId()).orElse(null);
            if (homework != null) {
                title = LanguageUtil.pick(acceptLanguage, homework.getTitleAr(), homework.getTitleEn());
                description = LanguageUtil.pick(
                        acceptLanguage,
                        LanguageUtil.firstNonBlank(homework.getDescriptionAr(), homework.getFeedbackAr()),
                        LanguageUtil.firstNonBlank(homework.getDescriptionEn(), homework.getFeedbackEn())
                );
            }
        } else if ("quiz".equalsIgnoreCase(itemType) || "final_quiz".equalsIgnoreCase(itemType)) {
            Quiz quiz = quizRepository.findById(item.getItemId()).orElse(null);
            if (quiz != null) {
                title = buildTreeQuizTitle(item, acceptLanguage);
                description = LanguageUtil.isArabic(acceptLanguage)
                        ? quiz.getTotalQuestions() + " أسئلة"
                        : quiz.getTotalQuestions() + " questions";
            }
        }

        return new TreeItemResponse(
                item.getId(),
                item.getTree().getId(),
                item.getItemId(),
                itemType,
                title,
                description,
                item.getStatus(),
                item.getOrderNum(),
                item.getGroupNumber(),
                item.getIsLocked(),
                item.getIsCompleted(),
                item.getMaxPoints(),
                item.getEarnedPoints(),
                item.getCompletedAt()
        );
    }

    private String buildTreeQuizTitle(TreeItem item, String acceptLanguage) {
        if ("final_quiz".equalsIgnoreCase(item.getItemType())) {
            return LanguageUtil.isArabic(acceptLanguage) ? "الاختبار النهائي" : "Final Quiz";
        }
        return LanguageUtil.isArabic(acceptLanguage)
                ? "اختبار المجموعة " + item.getGroupNumber()
                : "Group " + item.getGroupNumber() + " Quiz";
    }

    private String readText(JsonNode node, String fieldName) {
        JsonNode field = node.path(fieldName);
        if (field.isMissingNode() || field.isNull()) {
            return null;
        }
        String value = field.asText();
        return value == null || value.isBlank() ? null : value.trim();
    }
}
