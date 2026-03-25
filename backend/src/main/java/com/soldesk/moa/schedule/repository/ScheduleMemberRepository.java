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

public interface ScheduleMemberRepository extends JpaRepository<ScheduleMember, Long> {

    boolean existsByScheduleAndCircleMember(Schedule schedule, CircleMember circleMember);

    long countBySchedule(Schedule schedule);

    void deleteAllBySchedule(Schedule schedule);

    // 일정 참여 정보 조회
    Optional<ScheduleMember> findByScheduleAndCircleMember(
            Schedule schedule,
            CircleMember circleMember);

    // 참여 취소용
    void deleteByScheduleAndCircleMember(
            Schedule schedule,
            CircleMember circleMember);

    // 특정 CircleMember의 모든 ScheduleMember 조회 (탈퇴/강퇴 시 정리용)
    List<ScheduleMember> findByCircleMember(CircleMember circleMember);

    // 일정의 참여자 목록 조회
    List<ScheduleMember> findBySchedule(Schedule schedule);

    // 내가 참석한 일정 목록 (날짜 범위 필터 선택적)
    @Query("SELECT sm FROM ScheduleMember sm " +
           "WHERE sm.circleMember.user.userId = :userId " +
           "AND (:from IS NULL OR sm.schedule.startAt >= :from) " +
           "AND (:to IS NULL OR sm.schedule.startAt <= :to) " +
           "ORDER BY sm.schedule.startAt ASC")
    List<ScheduleMember> findByUserIdWithDateFilter(
            @Param("userId") Long userId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
