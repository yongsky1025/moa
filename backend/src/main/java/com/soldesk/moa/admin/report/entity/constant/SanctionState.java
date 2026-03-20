package com.soldesk.moa.admin.report.entity.constant;

public enum SanctionState {
    ACTIVE, // 진행중
    LIFTED, // 정상 해제 (기간 만료 or 의도적 해제)
    CANCELLED // 취소 (관리자 실수 - 처음부터 없었던 것처럼)
}
