package com.soldesk.moa.schedule.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleMember;
import com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus;

public interface ScheduleMemberRepository extends JpaRepository<ScheduleMember, Long> {

        boolean existsByScheduleAndCircleMember(Schedule schedule, CircleMember circleMember);

        long countBySchedule(Schedule schedule);

        // 상태별 카운트 (PENDING 수 집계용)
        long countByScheduleAndStatus(Schedule schedule, ScheduleMemberStatus status);

        void deleteAllBySchedule(Schedule schedule);

        // 일정 참여 정보 조회 (상태 무관)
        Optional<ScheduleMember> findByScheduleAndCircleMember(
                        Schedule schedule,
                        CircleMember circleMember);

        // 상태별 참여자 목록 조회 (JOIN만, PENDING만 등)
        List<ScheduleMember> findByScheduleAndStatus(Schedule schedule, ScheduleMemberStatus status);

        // 참여 취소용
        void deleteByScheduleAndCircleMember(
                        Schedule schedule,
                        CircleMember circleMember);

        // 특정 CircleMember의 모든 ScheduleMember 조회 (탈퇴/강퇴 시 정리용)
        List<ScheduleMember> findByCircleMember(CircleMember circleMember);

        // 일정의 참여자 목록 조회 (상태 무관)
        List<ScheduleMember> findBySchedule(Schedule schedule);

        // 내가 참석한 일정 목록 (JOIN 상태만, 날짜 범위 필터 선택적)
        @Query("SELECT sm FROM ScheduleMember sm " +
                        "WHERE sm.circleMember.user.userId = :userId " +
                        "AND sm.status = com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus.JOIN " +
                        "AND (:from IS NULL OR sm.schedule.startAt >= :from) " +
                        "AND (:to IS NULL OR sm.schedule.startAt <= :to) " +
                        "ORDER BY sm.schedule.startAt ASC")
        List<ScheduleMember> findByUserIdWithDateFilter(
                        @Param("userId") Long userId,
                        @Param("from") LocalDateTime from,
                        @Param("to") LocalDateTime to);

        // 후기 작성 자격 확인 (서클 일정 참여자 체크) - place파트에서 사용하는 쿼리입니다!
        @Query("SELECT COUNT(sm) > 0 FROM ScheduleMember sm " +
                        "WHERE sm.schedule.scheduleId = :scheduleId " +
                        "AND sm.circleMember.user.userId = :userId " +
                        "AND sm.status = :status")
        boolean existsByScheduleIdAndCircleMemberUserUserIdAndStatus(
                        @Param("scheduleId") Long scheduleId,
                        @Param("userId") Long userId,
                        @Param("status") ScheduleMemberStatus status);
}
