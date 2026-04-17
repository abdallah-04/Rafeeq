package com.rafeeq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notification_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationType {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private Integer id;

    @Column(name = "name_ar", length = 255)
    private String nameAr;

    @Column(name = "name_en", length = 255)
    private String nameEn;

    @OneToMany(mappedBy = "type", fetch = FetchType.LAZY)
    private List<Notification> notifications = new ArrayList<>();
}