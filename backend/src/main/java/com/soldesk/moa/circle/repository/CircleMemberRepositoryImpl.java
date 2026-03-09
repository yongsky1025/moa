package com.soldesk.moa.circle.repository;

import java.util.List;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.QCircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

import jakarta.persistence.EntityManager;

public class CircleMemberRepositoryImpl
                implements CircleMemberRepositoryCustom {

        private final JPAQueryFactory queryFactory;

        public CircleMemberRepositoryImpl(EntityManager em) {
                this.queryFactory = new JPAQueryFactory(em);
        }

        @Override
        public PageResultDTO<CircleMember> findMembers(
                        Long circleId,
                        CircleMemberStatus status,
                        PageRequestDTO pageRequestDTO) {

                QCircleMember member = QCircleMember.circleMember;

                int page = pageRequestDTO.getPage() - 1;
                int size = pageRequestDTO.getSize();

                List<CircleMember> content = queryFactory
                                .selectFrom(member)
                                .join(member.user).fetchJoin()
                                .where(
                                                member.circle.circleId.eq(circleId),
                                                statusEq(status))
                                .offset((long) page * size)
                                .limit(size)
                                .fetch();

                Long total = queryFactory
                                .select(member.count())
                                .from(member)
                                .where(
                                                member.circle.circleId.eq(circleId),
                                                statusEq(status))
                                .fetchOne();

                return PageResultDTO.<CircleMember>withAll()
                                .dtoList(content)
                                .pageRequestDTO(pageRequestDTO)
                                .totalCount(total == null ? 0 : total)
                                .build();
        }

        private BooleanExpression statusEq(CircleMemberStatus status) {
                return status == null ? null
                                : QCircleMember.circleMember.status.eq(status);
        }
}
