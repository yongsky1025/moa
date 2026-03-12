package com.soldesk.moa.admin.report.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.soldesk.moa.admin.report.dto.ReportFilterDTO;
import com.soldesk.moa.admin.report.entity.QReport;
import com.soldesk.moa.admin.report.entity.Report;

public class SearchReportRepositoryImpl extends QuerydslRepositorySupport implements SearchReportRepository {

    public SearchReportRepositoryImpl() {
        super(Report.class);
    }

    @Override
    public Page<Report> searchReports(ReportFilterDTO dto, Pageable pageable) {

        QReport report = QReport.report;

        return new PageImpl<>(null, pageable, 0);
    }

}
