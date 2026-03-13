package com.soldesk.moa.admin.report.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.admin.report.dto.SanctionFilterDTO;
import com.soldesk.moa.admin.report.entity.QSanction;
import com.soldesk.moa.admin.report.entity.Sanction;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class SearchSanctionRepositoryImpl implements SearchSanctionRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Sanction> searchSanctions(SanctionFilterDTO filterDTO, Pageable pageable) {

        QSanction sanction = QSanction.sanction;

        BooleanBuilder builder = new BooleanBuilder();

        // 필터링
        // 활성 여부
        if (filterDTO.getSanctionState() != null) {
            builder.and(sanction.sanctionState.eq(filterDTO.getSanctionState()));
        }

        // 제재 종류
        if (filterDTO.getSanctionType() != null) {
            builder.and(sanction.sanctionType.eq(filterDTO.getSanctionType()));
        }

        // 제재 대상 유형
        if (filterDTO.getTargetType() != null) {
            builder.and(sanction.targetType.eq(filterDTO.getTargetType()));
        }

        // 검색(이름으로만)
        if (filterDTO.getType() == "name" && filterDTO.getKeyword() != null && !filterDTO.getKeyword().isBlank()) {
            builder.and(sanction.targetUser.name.eq(filterDTO.getKeyword()));
        }

        List<Sanction> content = queryFactory
                .selectFrom(sanction)
                .join(sanction.targetUser).fetchJoin()
                .join(sanction.admin).fetchJoin()
                .where(builder)
                .orderBy(sanction.createDate.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = queryFactory
                .select(sanction.count())
                .from(sanction)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(content, pageable, total == null ? 0L : total);
    }

}
