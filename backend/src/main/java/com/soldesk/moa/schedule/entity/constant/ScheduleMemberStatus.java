package com.soldesk.moa.schedule.entity.constant;

public enum ScheduleMemberStatus {
    JOIN,
    PENDING,    // 취소 이력 있는 멤버의 재참여 승인 대기
    CANCELLED
}