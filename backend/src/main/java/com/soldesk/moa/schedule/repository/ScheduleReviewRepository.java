package com.soldesk.moa.schedule.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleReview;

public interface ScheduleReviewRepository extends JpaRepository<ScheduleReview, Long> {

    // 특정 일정의 후기 목록 (최신순)
    List<ScheduleReview> findByScheduleOrderByCreatedAtDesc(Schedule schedule);

    // 중복 작성 방지
    boolean existsByScheduleAndCircleMember(Schedule schedule, CircleMember circleMember);

    // 일정 삭제 시 후기도 함께 삭제
    void deleteAllBySchedule(Schedule schedule);

    // 서클 전체 최신 후기 조회 (서클 상세 페이지용)
    @Query("SELECT r FROM ScheduleReview r JOIN r.schedule s WHERE s.circle.circleId = :circleId ORDER BY r.createdAt DESC")
    List<ScheduleReview> findRecentByCircleId(@Param("circleId") Long circleId, Pageable pageable);
}
