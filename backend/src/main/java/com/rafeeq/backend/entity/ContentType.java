package com.rafeeq.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "content_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentType {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private Integer id;

    @Column(name = "name_ar", length = 255)
    private String nameAr;

    @Column(name = "name_en", length = 255)
    private String nameEn;

    @OneToMany(mappedBy = "contentType", fetch = FetchType.LAZY)
    private List<TreeItem> treeItems = new ArrayList<>();

    @OneToMany(mappedBy = "contentType", fetch = FetchType.LAZY)
    private List<ChildScoreLog> childScoreLogs = new ArrayList<>();
}