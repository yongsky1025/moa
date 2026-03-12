package com.soldesk.moa.admin.report.entity.constant;

public enum ReportStatus {
    PENDING, // 접수됨 (미검토)
    REVIEWING, // 검토중
    RESOLVED, // 처리완료
    REJECTED // 반려 (허위신고 등)
}
