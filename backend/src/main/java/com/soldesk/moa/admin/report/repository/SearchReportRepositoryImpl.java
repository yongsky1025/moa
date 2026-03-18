package com.soldesk.moa.admin.report.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.admin.report.dto.ReportFilterDTO;
import com.soldesk.moa.admin.report.entity.QReport;
import com.soldesk.moa.admin.report.entity.Report;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RequiredArgsConstructor
@Log4j2
public class SearchReportRepositoryImpl implements SearchReportRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Report> searchReports(ReportFilterDTO filterDTO, Pageable pageable) {

        QReport report = QReport.report;

        BooleanBuilder builder = new BooleanBuilder();

        // filter
        if (filterDTO.getStatus() != null) {
            builder.and(report.status.eq(filterDTO.getStatus()));
        }
        if (filterDTO.getTargetType() != null) {
            builder.and(report.targetType.eq(filterDTO.getTargetType()));
        }
        if (filterDTO.getCategory() != null) {
            builder.and(report.category.eq(filterDTO.getCategory()));
        }

        // 검색 (신고자 이름으로만)
        if ("name".equals(filterDTO.getType()) && filterDTO.getKeyword() != null && !filterDTO.getKeyword().isBlank()) {
            builder.and(report.reporter.name.contains(filterDTO.getKeyword()));
        }

        List<Report> content = queryFactory
                .selectFrom(report)
                .join(report.reporter).fetchJoin()
                .where(builder)
                .orderBy(report.createDate.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(report.count())
                .from(report)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0L : total);
    }

}
