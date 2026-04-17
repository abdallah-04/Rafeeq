package com.rafeeq.backend.entity;

import com.rafeeq.backend.entity_enums.Gender;
import com.rafeeq.backend.entity_enums.LearningDifficulty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.UUID;

@Entity
@Table(name = "child_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChildProfile {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToMany(mappedBy = "child", fetch = FetchType.LAZY)
    private List<ChildAssessment> assessments = new ArrayList<>();

    
    @OneToMany(mappedBy = "child", fetch = FetchType.LAZY)
    private List<LearningTree> learningTrees = new ArrayList<>();

    @OneToMany(mappedBy = "child", fetch = FetchType.LAZY)
    private List<ChildScore> childScores = new ArrayList<>();

    @OneToMany(mappedBy = "child", fetch = FetchType.LAZY)
    private List<ChildScoreLog> childScoreLogs = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Parent parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "full_name_ar", length = 255)
    private String fullNameAr;

    @Column(name = "full_name_en", length = 255)
    private String fullNameEn;

    @Column(name = "class_name", length = 255)
    private String className;

    @Column(name = "level")
    private Integer level;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 20)
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "learning_difficulty", length = 100)
    private LearningDifficulty learningDifficulty;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}