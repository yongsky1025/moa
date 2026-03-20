package com.soldesk.moa.admin.report.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.admin.report.entity.Sanction;
import com.soldesk.moa.admin.report.entity.constant.SanctionState;

public interface SanctionRepository extends JpaRepository<Sanction, Long>, SearchSanctionRepository {

    // 특정 유저의 현재 활성 제재 여부 확인 (로그인 시 체크용)
    Optional<Sanction> findByTargetUser_UserIdAndSanctionState(
            Long userId, SanctionState sanctionState);

    // 스케줄러용(제재 기한 만료됐는데 아직 isactive true인 제재)
    @Query("""
            select s
            from Sanction s
            join fetch s.targetUser
            where s.sanctionState = 'active'
                and s.endAt is not null
                and s.endAt < :now
            """)
    List<Sanction> findExpiredActiveSanctions(LocalDateTime now);

    // 특정 유저의 전체 제재 이력(취소 포함)
    List<Sanction> findByTargetUser_UserIdOrderByCreateDateDesc(Long userId);

    // // 경고 누적으로 자동 생성된 제재 찾기 (경고 취소 시 연쇄 취소용)
    // @Query("""
    // select s
    // from Sanction s
    // where s.targetUser.userId = :userId
    // and s.sanctionState = :state
    // and s.report is null
    // and s.reason like '%자동 제재%'
    // and s.createDate >= :warningCreatedAt
    // order by s.createDate asc
    // """)
    // Optional<Sanction> findAutoSanctionByWarning(Long userId, SanctionState
    // state, LocalDateTime warningCreatedAt);

    // 현재 취소하는 제재 외에 다른 활성 제재가 있는지 확인(유저 상태 복구 여부 결정)
    @Query("""
            select count(s) > 0
            from Sanction s
            where s.targetUser.userId = :userId
                and s.sanctionState = 'active'
                and s.id != :excludeSanctionId
            """)
    boolean existsOtherActiveSanction(
            @Param("userId") Long userId, @Param("excludeSanctionId") Long excludeSanctionId);
}
