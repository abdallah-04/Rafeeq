package com.rafeeq.backend.entity;

import com.rafeeq.backend.entity_enums.AppLanguage;
import com.rafeeq.backend.entity_enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, columnDefinition = "user_role")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private UserRole role;

    @Column(name = "national_id", length = 100)
    private String nationalId;


    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<ChatbotSession> chatbotSessions = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<SavedArticle> savedArticles = new ArrayList<>();

    @Column(name = "phone", unique = true, length = 50)
    private String phone;

    @Column(name = "email", unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, columnDefinition = "TEXT")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "language", columnDefinition = "app_language")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private AppLanguage language;

    @Column(name = "otp_code", length = 10)
    private String otpCode;

    @Column(name = "otp_expires_at")
    private LocalDateTime otpExpiresAt;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Parent parent;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Teacher teacher;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private School school;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private ChildProfile childProfile;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
        if (isVerified == null) {
            isVerified = false;
        }
        if (language == null) {
            language = AppLanguage.AR;
        }
    }
}