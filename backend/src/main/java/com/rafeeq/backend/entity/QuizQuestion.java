package com.rafeeq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "quiz_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question", columnDefinition = "TEXT")
    private String question;

    @Column(name = "question_ar", columnDefinition = "TEXT")
    private String questionAr;

    @Column(name = "question_en", columnDefinition = "TEXT")
    private String questionEn;

    @Column(name = "option_1", columnDefinition = "TEXT")
    private String option1;

    @Column(name = "option_2", columnDefinition = "TEXT")
    private String option2;

    @Column(name = "option_3", columnDefinition = "TEXT")
    private String option3;

    @Column(name = "option_4", columnDefinition = "TEXT")
    private String option4;

    @Column(name = "option_1_ar", columnDefinition = "TEXT")
    private String option1Ar;

    @Column(name = "option_2_ar", columnDefinition = "TEXT")
    private String option2Ar;

    @Column(name = "option_3_ar", columnDefinition = "TEXT")
    private String option3Ar;

    @Column(name = "option_4_ar", columnDefinition = "TEXT")
    private String option4Ar;

    @Column(name = "correct_option")
    private Integer correctOption;

    @Column(name = "order_num")
    private Integer orderNum;

    @Column(name = "points")
    private Integer points;

    @Column(name = "explanation_ar", columnDefinition = "TEXT")
    private String explanationAr;

    @Column(name = "explanation_en", columnDefinition = "TEXT")
    private String explanationEn;

    @OneToMany(mappedBy = "question", fetch = FetchType.LAZY)
    private List<QuizAnswer> answers = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}
