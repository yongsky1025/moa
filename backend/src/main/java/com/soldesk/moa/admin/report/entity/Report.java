package com.soldesk.moa.admin.report.entity;

import com.soldesk.moa.admin.report.entity.constant.ReportCategory;
import com.soldesk.moa.admin.report.entity.constant.ReportStatus;
import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = { "reporter" })
@Builder
public class Report extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 신고한 유저
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Users reporter;

    // 신고 대상 타입 (USER / POST / REPLY / CIRCLE / PLACE_REVIEW)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportTargetType targetType;

    // 신고 대상의 id (userid인지 postid인지)
    @Column(nullable = false)
    private Long targetId;

    // 신고 유형
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportCategory category;

    // 신고 상세 내용
    @Column(nullable = false)
    @Lob
    private String description;

    // 처리 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    // 관리자 처리 메모
    @Column(length = 500)
    private String adminNote;

    // 이하 메소드
    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public void setAdminNote(String note) {
        this.adminNote = note;
    }
}
