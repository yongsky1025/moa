package com.soldesk.moa.admin.report.entity;

import java.time.LocalDateTime;

import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.admin.report.entity.constant.SanctionState;
import com.soldesk.moa.admin.report.entity.constant.SanctionType;
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
@ToString(exclude = { "report", "targetUser", "admin" })
@Builder
public class Sanction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 연관 신고 (관리자 직권 제재 시 null 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private Report report;

    // 제재 대상 유저 (콘텐츠 제재 시에도 작성자를 기록)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id", nullable = false)
    private Users targetUser;

    // 제재 처리한 관리자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Users admin;

    // 제재 대상 타입 (어떤 대상에 제재를 내렸는지)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportTargetType targetType;

    // 제재 대상 ID (targetType이 USER면 userId, POST면 postId 등)
    @Column(nullable = false)
    private Long targetId;

    // 제재 종류
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SanctionType sanctionType;

    // 제재 사유
    @Column(nullable = false, length = 500)
    private String reason;

    // 제재 시작/종료 시간 (영구 정지는 endAt = null)
    @Column(nullable = false)
    private LocalDateTime startAt;

    private LocalDateTime endAt;

    // 제재 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SanctionState sanctionState = SanctionState.ACTIVE;

    // 취소 관련 (CANCELLED 시에만 값이 들어옴)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    private Users cancelledBy;

    @Column(length = 500)
    private String cancelReason;

    private LocalDateTime cancelledAt;

    // 이하 메소드
    // 제재 정상 해제
    public void lift() {
        this.sanctionState = SanctionState.LIFTED;
    }

    public boolean isActive() {
        return this.sanctionState == SanctionState.ACTIVE;
    }

    // 취소 (관리자 실수)
    public void cancel(Users cancelledBy, String cancelReason) {
        this.sanctionState = SanctionState.CANCELLED;
        this.cancelledBy = cancelledBy;
        this.cancelReason = cancelReason;
        this.cancelledAt = LocalDateTime.now();
    }

    // 제재 만료 여부 체크 (스케줄러에서 사용)
    public boolean isExpired() {
        if (endAt == null)
            return false; // 영구 정지
        return LocalDateTime.now().isAfter(endAt);
    }
}
