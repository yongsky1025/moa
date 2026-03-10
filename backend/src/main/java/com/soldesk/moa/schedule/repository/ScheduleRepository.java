package com.soldesk.moa.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.schedule.entity.Schedule;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
}