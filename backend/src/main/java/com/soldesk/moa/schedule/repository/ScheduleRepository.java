package com.soldesk.moa.schedule.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.schedule.entity.Schedule;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByCircle_CircleId(Long circleId);

    // 날짜 범위 필터 (from, to 둘 다 선택적)
    @Query("SELECT s FROM Schedule s WHERE s.circle.circleId = :circleId " +
           "AND (:from IS NULL OR s.startAt >= :from) " +
           "AND (:to IS NULL OR s.startAt <= :to) " +
           "ORDER BY s.startAt ASC")
    List<Schedule> findByCircleWithDateFilter(
            @Param("circleId") Long circleId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // 내가 생성한 앞으로의 일정 목록 (장소 예약 패널용)
    @Query("""
            SELECT s FROM Schedule s
            WHERE s.creator.user.userId = :userId
            AND s.startAt > :now
            ORDER BY s.startAt ASC
            """)
    List<Schedule> findMyCreatedUpcoming(
            @Param("userId") Long userId,
            @Param("now") LocalDateTime now);
}