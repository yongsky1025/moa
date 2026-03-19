package com.soldesk.moa.schedule.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

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
}
