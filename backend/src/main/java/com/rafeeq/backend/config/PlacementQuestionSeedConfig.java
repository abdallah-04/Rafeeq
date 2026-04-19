package com.rafeeq.backend.config;

import com.rafeeq.backend.entity.AssessmentQuestion;
import com.rafeeq.backend.entity.AssessmentQuestionAr;
import com.rafeeq.backend.entity.AssessmentQuestionEn;
import com.rafeeq.backend.repository.AssessmentQuestionArRepository;
import com.rafeeq.backend.repository.AssessmentQuestionEnRepository;
import com.rafeeq.backend.repository.AssessmentQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PlacementQuestionSeedConfig implements ApplicationRunner {

    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final AssessmentQuestionArRepository assessmentQuestionArRepository;
    private final AssessmentQuestionEnRepository assessmentQuestionEnRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (assessmentQuestionRepository.count() > 0) {
            return;
        }

        seedQuestion(
                UUID.fromString("00000000-0000-0000-0000-000000000101"),
                UUID.fromString("10000000-0000-0000-0000-000000000101"),
                UUID.fromString("20000000-0000-0000-0000-000000000101"),
                1, 1, 1, 1,
                "اختر الحرف أ",
                List.of("أ", "ب", "ت", "ث"),
                "Choose the letter A",
                List.of("A", "B", "C", "D")
        );
        seedQuestion(
                UUID.fromString("00000000-0000-0000-0000-000000000102"),
                UUID.fromString("10000000-0000-0000-0000-000000000102"),
                UUID.fromString("20000000-0000-0000-0000-000000000102"),
                1, 2, 3, 1,
                "كم عدد التفاحات هنا؟ (ثلاث)",
                List.of("واحد", "اثنان", "ثلاثة", "أربعة"),
                "How many apples are there? (three)",
                List.of("One", "Two", "Three", "Four")
        );
        seedQuestion(
                UUID.fromString("00000000-0000-0000-0000-000000000201"),
                UUID.fromString("10000000-0000-0000-0000-000000000201"),
                UUID.fromString("20000000-0000-0000-0000-000000000201"),
                2, 3, 3, 1,
                "ما ناتج 2 + 1؟",
                List.of("2", "3", "4", "5"),
                "What is 2 + 1?",
                List.of("2", "3", "4", "5")
        );
        seedQuestion(
                UUID.fromString("00000000-0000-0000-0000-000000000202"),
                UUID.fromString("10000000-0000-0000-0000-000000000202"),
                UUID.fromString("20000000-0000-0000-0000-000000000202"),
                2, 4, 2, 1,
                "اختر الكلمة الصحيحة: مدرسة",
                List.of("مدرسة", "مكتبة", "طائرة", "شجرة"),
                "Choose the correct word: school",
                List.of("School", "Library", "Airplane", "Tree")
        );
        seedQuestion(
                UUID.fromString("00000000-0000-0000-0000-000000000301"),
                UUID.fromString("10000000-0000-0000-0000-000000000301"),
                UUID.fromString("20000000-0000-0000-0000-000000000301"),
                3, 5, 3, 1,
                "ما ناتج 5 - 2؟",
                List.of("1", "2", "3", "4"),
                "What is 5 - 2?",
                List.of("1", "2", "3", "4")
        );
        seedQuestion(
                UUID.fromString("00000000-0000-0000-0000-000000000302"),
                UUID.fromString("10000000-0000-0000-0000-000000000302"),
                UUID.fromString("20000000-0000-0000-0000-000000000302"),
                3, 6, 2, 1,
                "اقرأ الجملة ثم اختر الكلمة الناقصة: أنا ___ كتابا",
                List.of("يلعب", "أقرأ", "يشرب", "يركض"),
                "Read the sentence and choose the missing word: I ___ a book",
                List.of("play", "read", "drink", "run")
        );
    }

    private void seedQuestion(
            UUID questionId,
            UUID questionArId,
            UUID questionEnId,
            int level,
            int orderNum,
            int correctOption,
            int points,
            String questionAr,
            List<String> optionsAr,
            String questionEn,
            List<String> optionsEn
    ) {
        AssessmentQuestion question = new AssessmentQuestion();
        question.setId(questionId);
        question.setLevel(level);
        question.setOrderNum(orderNum);
        question.setCorrectOption(correctOption);
        question.setPoints(points);
        assessmentQuestionRepository.save(question);

        AssessmentQuestionAr arabic = new AssessmentQuestionAr();
        arabic.setId(questionArId);
        arabic.setQuestion(question);
        arabic.setQuestionText(questionAr);
        arabic.setOption1(optionsAr.get(0));
        arabic.setOption2(optionsAr.get(1));
        arabic.setOption3(optionsAr.get(2));
        arabic.setOption4(optionsAr.get(3));
        assessmentQuestionArRepository.save(arabic);

        AssessmentQuestionEn english = new AssessmentQuestionEn();
        english.setId(questionEnId);
        english.setQuestion(question);
        english.setQuestionText(questionEn);
        english.setOption1(optionsEn.get(0));
        english.setOption2(optionsEn.get(1));
        english.setOption3(optionsEn.get(2));
        english.setOption4(optionsEn.get(3));
        assessmentQuestionEnRepository.save(english);
    }
}
