package com.soldesk.moa.common.entity;

import com.soldesk.moa.common.entity.constant.FileDomain;
import com.soldesk.moa.common.entity.constant.FileStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "common_file")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommonFile extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String uuid;

    @Column(nullable = false)
    private String path;

    @Column(nullable = false, length = 100)
    private String contentType;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FileDomain domain = FileDomain.COMMON;

    @Column(nullable = true)
    private Long ownerId;

    @Column(nullable = false)
    private Long uploadedByUserId;

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private FileStatus status = FileStatus.USED;
}
