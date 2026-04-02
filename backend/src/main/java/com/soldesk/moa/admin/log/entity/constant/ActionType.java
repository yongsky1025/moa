package com.soldesk.moa.admin.log.entity.constant;

public enum ActionType {
    // 기본 CRUD
    CREATE,
    UPDATE,
    DELETE,
    // 인증
    LOGIN,
    LOGOUT,
    WITHDRAW,
    // 서클
    JOIN_CIRCLE,
    LEAVE_CIRCLE,
    // 관리자 전용
    APPROVE,
    REJECT,
    CLOSE,
    RESTORE,
    SANCTION,
    CANCEL_SANCTION,
    REPORT,
    RESOLVE_REPORT,
    // 예약/결제
    RESERVE,
    CANCEL_RESERVATION,
    //
    UNKNOWN
}
