package com.soldesk.moa.admin.report.entity.constant;

public enum SanctionType {
    WARNING, // 경고 (제재 없이 경고만)
    BAN_1D, // 1일 정지
    BAN_3D, // 3일 정지
    BAN_30D, // 30일 정지
    PERMANENT_BAN, // 영구 정지
    CONTENT_DELETE // 콘텐츠 삭제만 (계정 제재 없음)
}
