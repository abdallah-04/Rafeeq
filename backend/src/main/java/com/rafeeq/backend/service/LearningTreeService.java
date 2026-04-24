package com.rafeeq.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rafeeq.backend.entity.*;
import com.rafeeq.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LearningTreeService {

    private final OpenAiService openAiService;
    private final ChildProfileRepository childProfileRepository;
    private final LearningTreeRepository learningTreeRepository;
    private final TreeItemRepository treeItemRepository;
    private final ActivityRepository activityRepository;
    private final HomeworkRepository homeworkRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ContentTypeRepository contentTypeRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Content Type IDs
    private static final int HOMEWORK_TYPE = 1;
    private static final int QUIZ_TYPE = 2;
    private static final int ACTIVITY_TYPE = 3;

    // ═══════════════════════════════════════════
    // الدالة الرئيسية — تولد الشجرة كاملة
    // ═══════════════════════════════════════════
    @Transactional
    public LearningTree generateTree(String childId) throws Exception {

        // 1. جيب معلومات الطفل
        ChildProfile child = childProfileRepository.findById(java.util.UUID.fromString(childId))
                .orElseThrow(() -> new RuntimeException("Child not found"));

        String childName = child.getFullNameAr() != null ? child.getFullNameAr() : "طفل";

        int age = 5; // default
        if (child.getDateOfBirth() != null) {
            age = java.time.Period.between(child.getDateOfBirth(), java.time.LocalDate.now()).getYears();
        }

        int level = child.getLevel() != null ? child.getLevel() : 1;

        // موضوع مؤقت — رح يجي من DB لاحقاً
        String topicAr = "الأرقام ١-١٠";
        String topicEn = "Numbers 1-10";

        // 2. بعث لـ OpenAI
        
        String jsonResponse = getMockResponse();
        // String jsonResponse = openAiService.generateLearningTree(
        //     childName, age, topicAr, topicEn, level
        // );

        // 3. احفظ الشجرة
        LearningTree tree = new LearningTree();
        tree.setChild(child);
        tree.setLevel(level);
        tree.setTopic(topicAr);
        tree.setStatus("active");
        tree.setModelUsed("gpt-4o-mini");
        tree.setPromptVersion("v2");

        // حلل الـ JSON أولاً
        JsonNode root = objectMapper.readTree(jsonResponse);

        // احفظ الـ summary من الـ AI
        tree.setAiSummaryAr(root.has("summary_ar") ?
            root.get("summary_ar").asText() : "");
        tree.setAiSummaryEn(root.has("summary_en") ?
            root.get("summary_en").asText() : "");

        // احفظ الشجرة
        learningTreeRepository.save(tree);
        JsonNode groups = root.get("groups");

        int orderNum = 1;

        // ═══════════════════════════════════════════
        // المجموعات الثلاث
        // ═══════════════════════════════════════════
        for (JsonNode group : groups) {
            int groupNumber = group.get("group_number").asInt();

            // ── Activity ──
            JsonNode actNode = group.get("activity");
            Activity activity = new Activity();
            activity.setChild(child);
            activity.setTree(tree);
            activity.setTitleAr(actNode.get("title_ar").asText());
            activity.setTitleEn(actNode.get("title_en").asText());
            activity.setDescriptionAr(actNode.get("description_ar").asText());
            activity.setDescriptionEn(actNode.get("description_en").asText());
            activity.setActivityTaskAr(actNode.get("activity_task_ar").asText());
            activity.setActivityTaskEn(actNode.get("activity_task_en").asText());
            activity.setParentGuideAr(actNode.get("parent_guide_ar").asText());
            activity.setParentGuideEn(actNode.get("parent_guide_en").asText());
            activity.setGroupNumber(groupNumber);
            activity.setOrderNum(orderNum);
            activity.setStatus("pending");
            activityRepository.save(activity);

            // TreeItem للـ Activity
            TreeItem actItem = new TreeItem();
            actItem.setTree(tree);
            actItem.setContentType(contentTypeRepository.getReferenceById(ACTIVITY_TYPE));
            actItem.setItemId(activity.getId());
            actItem.setItemType("activity");
            actItem.setGroupNumber(groupNumber);
            actItem.setOrderNum(orderNum);
            actItem.setIsLocked(orderNum != 1); // الأول مفتوح بس
            actItem.setIsCompleted(false);
            actItem.setStatus("pending");
            actItem.setMaxPoints(10);
            actItem.setEarnedPoints(0);
            treeItemRepository.save(actItem);
            orderNum++;

            // ── Homework ──
            JsonNode hwNode = group.get("homework");
            Homework homework = new Homework();
            homework.setChild(child);
            homework.setTree(tree);
            homework.setTitleAr(hwNode.get("title_ar").asText());
            homework.setTitleEn(hwNode.get("title_en").asText());
            homework.setDescriptionAr(hwNode.get("description_ar").asText());
            homework.setDescriptionEn(hwNode.get("description_en").asText());
            homework.setGroupNumber(groupNumber);
            homework.setOrderNum(orderNum);
             homework.setStartDate(java.time.LocalDate.now());
            homework.setDueDate(java.time.LocalDate.now().plusDays(7));
            homework.setStatus("pending");
            
            homeworkRepository.save(homework);

            // TreeItem للـ Homework
            TreeItem hwItem = new TreeItem();
            hwItem.setTree(tree);
            hwItem.setContentType(contentTypeRepository.getReferenceById(HOMEWORK_TYPE));
            hwItem.setItemId(homework.getId());
            hwItem.setItemType("homework");
            hwItem.setGroupNumber(groupNumber);
            hwItem.setOrderNum(orderNum);
            hwItem.setIsLocked(true);
            hwItem.setIsCompleted(false);
            hwItem.setStatus("pending");
            hwItem.setMaxPoints(10);
            hwItem.setEarnedPoints(0); 
            treeItemRepository.save(hwItem);
            orderNum++;

            // ── Quiz ──
            JsonNode quizNode = group.get("quiz");
            Quiz quiz = new Quiz();
            quiz.setChild(child);
            quiz.setTree(tree);
            quiz.setLevel(level);
            quiz.setTotalQuestions(5);
            quiz.setStatus("pending");
            quizRepository.save(quiz);

            // احفظ الأسئلة
            int qOrder = 1;
            for (JsonNode q : quizNode.get("questions")) {
                QuizQuestion question = new QuizQuestion();
                question.setQuiz(quiz);
                question.setQuestion(q.get("question_en").asText());
                question.setQuestionAr(q.get("question_ar").asText());
                question.setOption1(q.get("option_1").asText());
                question.setOption2(q.get("option_2").asText());
                question.setOption3(q.get("option_3").asText());
                question.setOption4(q.get("option_4").asText());
                question.setOption1Ar(q.get("option_1_ar").asText());
                question.setOption2Ar(q.get("option_2_ar").asText());
                question.setOption3Ar(q.get("option_3_ar").asText());
                question.setOption4Ar(q.get("option_4_ar").asText());
                question.setCorrectOption(q.get("correct_option").asInt());
                question.setExplanationAr(q.get("explanation_ar").asText());
                question.setExplanationEn(q.get("explanation_en").asText());
                question.setOrderNum(qOrder++);
                question.setPoints(10);
                quizQuestionRepository.save(question);
            }

            // TreeItem للـ Quiz
            TreeItem quizItem = new TreeItem();
            quizItem.setTree(tree);
            quizItem.setContentType(contentTypeRepository.getReferenceById(QUIZ_TYPE));
            quizItem.setItemId(quiz.getId());
            quizItem.setItemType("quiz");
            quizItem.setGroupNumber(groupNumber);
            quizItem.setOrderNum(orderNum);
            quizItem.setIsLocked(true);
            quizItem.setIsCompleted(false);
            quizItem.setStatus("pending");
            quizItem.setMaxPoints(50);
            quizItem.setEarnedPoints(0);
            treeItemRepository.save(quizItem);
            orderNum++;
        }

        // ═══════════════════════════════════════════
        // Final Exam
        // ═══════════════════════════════════════════
        JsonNode finalExam = root.get("final_exam");
        Quiz finalQuiz = new Quiz();
        finalQuiz.setChild(child);
        finalQuiz.setTree(tree);
        finalQuiz.setLevel(level);
        finalQuiz.setTotalQuestions(10);
        finalQuiz.setStatus("pending");
        quizRepository.save(finalQuiz);

        int fOrder = 1;
        for (JsonNode q : finalExam.get("questions")) {
            QuizQuestion question = new QuizQuestion();
            question.setQuiz(finalQuiz);
            question.setQuestion(q.get("question_en").asText());
            question.setQuestionAr(q.get("question_ar").asText());
            question.setOption1(q.get("option_1").asText());
            question.setOption2(q.get("option_2").asText());
            question.setOption3(q.get("option_3").asText());
            question.setOption4(q.get("option_4").asText());
            question.setOption1Ar(q.get("option_1_ar").asText());
            question.setOption2Ar(q.get("option_2_ar").asText());
            question.setOption3Ar(q.get("option_3_ar").asText());
            question.setOption4Ar(q.get("option_4_ar").asText());
            question.setCorrectOption(q.get("correct_option").asInt());
            question.setExplanationAr(q.get("explanation_ar").asText());
            question.setExplanationEn(q.get("explanation_en").asText());
            question.setOrderNum(fOrder++);
            question.setPoints(10);
            quizQuestionRepository.save(question);
        }

       
        TreeItem finalItem = new TreeItem();
        finalItem.setTree(tree);
        finalItem.setContentType(contentTypeRepository.getReferenceById(QUIZ_TYPE));
        finalItem.setItemId(finalQuiz.getId());
        finalItem.setItemType("final_exam");
        finalItem.setGroupNumber(0);
        finalItem.setOrderNum(orderNum);
        finalItem.setIsLocked(true);
        finalItem.setIsCompleted(false);
        finalItem.setStatus("pending");
        finalItem.setMaxPoints(100);
        finalItem.setEarnedPoints(0);
        treeItemRepository.save(finalItem);

        return tree;
    }

   
    private String getMockResponse() throws Exception {
        org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource(
                "mock/mock_tree_response.json");
        return new String(
                resource.getInputStream().readAllBytes(),
                java.nio.charset.StandardCharsets.UTF_8);
    }
// ═══════════════════════════════════════════
// Revision Tree 
// ═══════════════════════════════════════════
@Transactional
public LearningTree generateRevisionTree(String childId) throws Exception {

   
    ChildProfile child = childProfileRepository
        .findById(java.util.UUID.fromString(childId))
        .orElseThrow(() -> new RuntimeException("Child not found"));

    int level = child.getLevel() != null ? child.getLevel() : 1;

   
    String topicAr = "مراجعة — الأرقام 1-10";
    String topicEn = "Revision — Numbers 1-10";

    
    String jsonResponse = getMockResponse();

   
    LearningTree tree = new LearningTree();
    tree.setChild(child);
    tree.setLevel(level);
    tree.setTopic(topicAr + " (مراجعة)");
    tree.setStatus("active");
    tree.setModelUsed("gpt-4o-mini");
    tree.setPromptVersion("v2-revision");

    JsonNode root = objectMapper.readTree(jsonResponse);

    tree.setAiSummaryAr("شجرة مراجعة للمستوى " + level);
    tree.setAiSummaryEn("Revision tree for level " + level);

    learningTreeRepository.save(tree);

  
    JsonNode groups = root.get("groups");
    int orderNum = 1;

    for (JsonNode group : groups) {
        int groupNumber = group.get("group_number").asInt();

        JsonNode actNode = group.get("activity");
        Activity activity = new Activity();
        activity.setChild(child);
        activity.setTree(tree);
        activity.setTitleAr(actNode.get("title_ar").asText());
        activity.setTitleEn(actNode.get("title_en").asText());
        activity.setDescriptionAr(actNode.get("description_ar").asText());
        activity.setDescriptionEn(actNode.get("description_en").asText());
        activity.setActivityTaskAr(actNode.get("activity_task_ar").asText());
        activity.setActivityTaskEn(actNode.get("activity_task_en").asText());
        activity.setParentGuideAr(actNode.get("parent_guide_ar").asText());
        activity.setParentGuideEn(actNode.get("parent_guide_en").asText());
        activity.setGroupNumber(groupNumber);
        activity.setOrderNum(orderNum);
        activity.setStatus("pending");
        activityRepository.save(activity);

        TreeItem actItem = new TreeItem();
        actItem.setTree(tree);
        actItem.setContentType(contentTypeRepository.getReferenceById(ACTIVITY_TYPE));
        actItem.setItemId(activity.getId());
        actItem.setItemType("activity");
        actItem.setGroupNumber(groupNumber);
        actItem.setOrderNum(orderNum);
        actItem.setIsLocked(orderNum != 1);
        actItem.setIsCompleted(false);
        actItem.setStatus("pending");
        actItem.setMaxPoints(10);
        actItem.setEarnedPoints(0);
        treeItemRepository.save(actItem);
        orderNum++;

        JsonNode hwNode = group.get("homework");
        Homework homework = new Homework();
        homework.setChild(child);
        homework.setTree(tree);
        homework.setTitleAr(hwNode.get("title_ar").asText());
        homework.setTitleEn(hwNode.get("title_en").asText());
        homework.setDescriptionAr(hwNode.get("description_ar").asText());
        homework.setDescriptionEn(hwNode.get("description_en").asText());
        homework.setGroupNumber(groupNumber);
        homework.setOrderNum(orderNum);
        homework.setStartDate(java.time.LocalDate.now());
        homework.setDueDate(java.time.LocalDate.now().plusDays(7));
        homework.setStatus("pending");
        homeworkRepository.save(homework);

        TreeItem hwItem = new TreeItem();
        hwItem.setTree(tree);
        hwItem.setContentType(contentTypeRepository.getReferenceById(HOMEWORK_TYPE));
        hwItem.setItemId(homework.getId());
        hwItem.setItemType("homework");
        hwItem.setGroupNumber(groupNumber);
        hwItem.setOrderNum(orderNum);
        hwItem.setIsLocked(true);
        hwItem.setIsCompleted(false);
        hwItem.setStatus("pending");
        hwItem.setMaxPoints(10);
        hwItem.setEarnedPoints(0);
        treeItemRepository.save(hwItem);
        orderNum++;

        JsonNode quizNode = group.get("quiz");
        Quiz quiz = new Quiz();
        quiz.setChild(child);
        quiz.setTree(tree);
        quiz.setLevel(level);
        quiz.setTotalQuestions(3);
        quiz.setStatus("pending");
        quizRepository.save(quiz);

        for (JsonNode q : quizNode.get("questions")) {
            QuizQuestion question = new QuizQuestion();
            question.setQuiz(quiz);
            question.setQuestion(q.get("question_en").asText());
            question.setQuestionAr(q.get("question_ar").asText());
            question.setOption1(q.get("option_1").asText());
            question.setOption2(q.get("option_2").asText());
            question.setOption3(q.get("option_3").asText());
            question.setOption4(q.get("option_4").asText());
            question.setOption1Ar(q.get("option_1_ar").asText());
            question.setOption2Ar(q.get("option_2_ar").asText());
            question.setOption3Ar(q.get("option_3_ar").asText());
            question.setOption4Ar(q.get("option_4_ar").asText());
            question.setCorrectOption(q.get("correct_option").asInt());
            question.setExplanationAr(q.get("explanation_ar").asText());
            question.setExplanationEn(q.get("explanation_en").asText());
            question.setOrderNum(1);
            question.setPoints(10);
            quizQuestionRepository.save(question);
        }

        TreeItem quizItem = new TreeItem();
        quizItem.setTree(tree);
        quizItem.setContentType(contentTypeRepository.getReferenceById(QUIZ_TYPE));
        quizItem.setItemId(quiz.getId());
        quizItem.setItemType("quiz");
        quizItem.setGroupNumber(groupNumber);
        quizItem.setOrderNum(orderNum);
        quizItem.setIsLocked(true);
        quizItem.setIsCompleted(false);
        quizItem.setStatus("pending");
        quizItem.setMaxPoints(50);
        quizItem.setEarnedPoints(0);
        treeItemRepository.save(quizItem);
        orderNum++;
    }

    // Final Exam
    JsonNode finalExam = root.get("final_exam");
    Quiz finalQuiz = new Quiz();
    finalQuiz.setChild(child);
    finalQuiz.setTree(tree);
    finalQuiz.setLevel(level);
    finalQuiz.setTotalQuestions(5);
    finalQuiz.setStatus("pending");
    quizRepository.save(finalQuiz);

    for (JsonNode q : finalExam.get("questions")) {
        QuizQuestion question = new QuizQuestion();
        question.setQuiz(finalQuiz);
        question.setQuestion(q.get("question_en").asText());
        question.setQuestionAr(q.get("question_ar").asText());
        question.setOption1(q.get("option_1").asText());
        question.setOption2(q.get("option_2").asText());
        question.setOption3(q.get("option_3").asText());
        question.setOption4(q.get("option_4").asText());
        question.setOption1Ar(q.get("option_1_ar").asText());
        question.setOption2Ar(q.get("option_2_ar").asText());
        question.setOption3Ar(q.get("option_3_ar").asText());
        question.setOption4Ar(q.get("option_4_ar").asText());
        question.setCorrectOption(q.get("correct_option").asInt());
        question.setExplanationAr(q.get("explanation_ar").asText());
        question.setExplanationEn(q.get("explanation_en").asText());
        question.setOrderNum(1);
        question.setPoints(10);
        quizQuestionRepository.save(question);
    }

    TreeItem finalItem = new TreeItem();
    finalItem.setTree(tree);
    finalItem.setContentType(contentTypeRepository.getReferenceById(QUIZ_TYPE));
    finalItem.setItemId(finalQuiz.getId());
    finalItem.setItemType("final_exam");
    finalItem.setGroupNumber(0);
    finalItem.setOrderNum(orderNum);
    finalItem.setIsLocked(true);
    finalItem.setIsCompleted(false);
    finalItem.setStatus("pending");
    finalItem.setMaxPoints(100);
    finalItem.setEarnedPoints(0);
    treeItemRepository.save(finalItem);

    return tree;
}
}
