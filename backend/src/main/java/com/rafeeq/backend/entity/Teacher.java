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
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "teacher", fetch = FetchType.LAZY)
    private List<ChildAssessment> childAssessments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    @Column(name = "full_name_ar", length = 255)
    private String fullNameAr;

    @Column(name = "full_name_en", length = 255)
    private String fullNameEn;

    @Column(name = "specialization", length = 255)
    private String specialization;


    @OneToMany(mappedBy = "teacher", fetch = FetchType.LAZY)
    private List<Homework> homeworks = new ArrayList<>();

    @OneToMany(mappedBy = "teacher", fetch = FetchType.LAZY)
    private List<ChildProfile> childProfiles = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}