package com.soldesk.moa.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleMember;

public interface ScheduleMemberRepository extends JpaRepository<ScheduleMember, Long> {

    boolean existsByScheduleAndCircleMember(Schedule schedule, CircleMember circleMember);

    long countBySchedule(Schedule schedule);
}
