package com.soldesk.moa.circle.entity.constant;

public enum CircleStatus {
    PENDING, // 관리자 승인 대기
    OPEN, // 모집중
    FULL, // 정원 마감
    REJECTED, // 관리자 거절
    CLOSED // 강제 해산 (3회 누적)
}