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
     * 2~4회 -> 운영방침에 의거한 제재 타입 결정
     * 5회 -> 제재 누적으로 인한 영구 정지
     */
    public static boolean isAutoPermabanCount(int count) {
        return count >= 5;
    }
}
