package com.soldesk.moa.admin.report.entity.constant;

public enum SanctionType {
    WARNING, // 경고 (제재 없이 경고만)
    BAN_1D, // 1일 정지
    BAN_3D, // 3일 정지
    BAN_30D, // 30일 정지
    PERMANENT_BAN, // 영구 정지
    CONTENT_DELETE; // 콘텐츠 삭제만 (계정 제재 없음)

    /*
     * 경고 누적 시 자동 전환될 제재 타입
     * 1회 -> 경고
     * 2회 -> 1일
     * 3회 -> 3일
     * 4회 -> 30일 정지
     * 5회 -> 영구 정지
     */
    public static SanctionType getAutoSanctionByWarningCount(int count) {
        return switch (count) {
            case 2 -> BAN_1D;
            case 3 -> BAN_3D;
            case 4 -> BAN_30D;
            default -> count >= 5 ? PERMANENT_BAN : WARNING;
        };
    }
}
