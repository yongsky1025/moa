package com.soldesk.moa.schedule.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.schedule.entity.Schedule;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByCircle_CircleId(Long circleId);
}