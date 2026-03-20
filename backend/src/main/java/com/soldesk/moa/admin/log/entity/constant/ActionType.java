package com.soldesk.moa.admin.log.entity.constant;

public enum ActionType {
    // 기본 crud 행동 파악
    CREATE,
    UPDATE,
    DELETE,
    // 인증
    LOGIN,
    LOGOUT,
    WITHDRAW,
    //
    JOIN_CIRCLE,
    LEAVE_CIRCLE,
    UNKNOWN
}
