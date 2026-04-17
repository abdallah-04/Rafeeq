package com.rafeeq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "assessment_questions_ar")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentQuestionAr {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false, unique = true)
    private AssessmentQuestion question;

    @Column(name = "question", columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "option_1", columnDefinition = "TEXT")
    private String option1;

    @Column(name = "option_2", columnDefinition = "TEXT")
    private String option2;

    @Column(name = "option_3", columnDefinition = "TEXT")
    private String option3;

    @Column(name = "option_4", columnDefinition = "TEXT")
    private String option4;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}