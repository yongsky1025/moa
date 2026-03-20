package com.soldesk.moa.admin.report.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.admin.report.entity.Report;
import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;

public interface ReportRepository extends JpaRepository<Report, Long>, SearchReportRepository {

    // 중복 신고 체크(jpa query 메소드임 query문 작성 불필요)
    boolean existsByReporter_UserIdAndTargetTypeAndTargetId(
            Long reporterId,
            ReportTargetType targetType,
            Long targetId);
}
