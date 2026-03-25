package com.soldesk.moa.admin.report.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.soldesk.moa.admin.report.dto.ReportFilterDTO;
import com.soldesk.moa.admin.report.entity.Report;

public interface SearchReportRepository {

    // 신고 리스트 조회
    Page<Report> searchReports(ReportFilterDTO dto, Pageable pageable);
}
